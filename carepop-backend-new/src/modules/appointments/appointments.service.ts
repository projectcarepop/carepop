import { db, supabaseAdmin } from '../../db/drizzle';
import { clinics, providerAvailability, appointments, services, clinicServices, serviceCategories, profiles, providers, clinicProviders, providerServices } from '../../db/schema';
import { ApiError } from '../../lib/errors';
import { eq, and, gte, lt, inArray, asc, desc, or, ilike, sql, getTableColumns, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  startOfDay,
  endOfDay,
  parseISO,
  getDay,
  setHours,
  setMinutes,
  isBefore,
  addMinutes,
  format,
} from 'date-fns';
import { z } from 'zod';
import {
  getAdminAppointmentsSchema,
  getProviderAvailabilitySchema,
  getAvailabilitySchema as getServiceAvailabilitySchema,
} from './appointments.validation';

async function getClinics() {
  try {
    // For now, this is a simple fetch. We can add more complex logic later,
    // like filtering by location, etc.
    const data = await db.query.clinics.findMany({
      orderBy: (clinics, { asc }) => [asc(clinics.name)],
    });
    return data;
  } catch (error) {
    console.error('Error fetching clinics for booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve clinics. Database error: ${errorMessage}`);
  }
}

async function getServicesForClinic(clinicId: string, specializationId?: string) {
  try {
    // Step 1: Get all service IDs for the given clinic.
    const clinicServiceIds = await db
      .select({ serviceId: clinicServices.serviceId })
      .from(clinicServices)
      .where(eq(clinicServices.clinicId, clinicId));

    if (clinicServiceIds.length === 0) {
      return []; // No services offered at this clinic.
    }
    
    const serviceIds = clinicServiceIds.map(cs => cs.serviceId);

    // Step 2: Build the query to get the actual services.
    const query = db.query.services.findMany({
        where: (service, { and, eq }) => {
            const conditions = [inArray(service.id, serviceIds)];
            if (specializationId) {
                conditions.push(eq(service.serviceCategoryId, specializationId));
            }
            return and(...conditions);
        },
        with: {
            serviceCategory: {
                columns: {
                    id: true,
                    name: true,
                    description: true,
                }
            },
        },
        orderBy: (service, { asc }) => [asc(service.name)],
    });

    return await query;
    
  } catch (error) {
    console.error(`Error fetching services for clinic ${clinicId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve services for clinic. Database error: ${errorMessage}`);
  }
}

async function getServiceAvailabilityForClinic(clinicId: string, serviceId: string, date: string) {
  try {
    const targetDate = parseISO(date);
    const dayOfWeekName = format(targetDate, 'EEEE'); // e.g., "Monday"

    // Use the Supabase admin client for the privileged query
    const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select('startTime:start_time, endTime:end_time')
      .eq('clinic_id', clinicId)
      .gte('start_time', startOfDay(targetDate).toISOString())
      .lt('start_time', endOfDay(targetDate).toISOString());

    if (appointmentsError) {
      throw appointmentsError;
    }

    // Fetch clinic and service info with the standard client
    const [clinic, service] = await Promise.all([
      db.query.clinics.findFirst({ where: eq(clinics.id, clinicId) }),
      db.query.services.findFirst({ where: eq(services.id, serviceId) }),
    ]);

    // 2. Validate essential data
    if (!clinic || !service) {
      throw new ApiError(404, 'Clinic or service not found.');
    }
    if (!clinic.operationDays?.includes(dayOfWeekName)) {
      return []; // Clinic is closed on this day.
    }
    
    // 3. Generate a grid of 30-minute slots based on the clinic's hours
    const [openTime, closeTime] = (clinic.operationHours || '09:00-17:00').split('-');
    const [startHour, startMinute] = openTime.split(':').map(Number);
    const [endHour, endMinute] = closeTime.split(':').map(Number);
    
    let potentialSlotStart = setMinutes(setHours(startOfDay(targetDate), startHour), startMinute);
    const clinicCloseTime = setMinutes(setHours(startOfDay(targetDate), endHour), endMinute);
    
    const serviceDuration = service.durationMinutes || 30;
    const availableSlots = new Set<string>();

    while (potentialSlotStart < clinicCloseTime) {
      const potentialSlotEnd = addMinutes(potentialSlotStart, serviceDuration);

      if (potentialSlotEnd > clinicCloseTime) {
        break; // Slot extends beyond closing time
      }

      // 4. Check for conflicts with existing appointments
      const isOverlapping = allAppointments.some(booking =>
        potentialSlotStart < new Date(booking.endTime) && potentialSlotEnd > new Date(booking.startTime)
      );

      if (!isOverlapping) {
        availableSlots.add(format(potentialSlotStart, 'HH:mm'));
      }
      
      // Move to the next 30-minute increment
      potentialSlotStart = addMinutes(potentialSlotStart, 30);
    }
    
    return Array.from(availableSlots).sort();

  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`Error fetching availability for service ${serviceId} at clinic ${clinicId} on ${date}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve availability. Database error: ${errorMessage}`);
  }
}

async function getProviderAvailability(providerId: string, date: string) {
    try {
        const targetDate = parseISO(date);
        const dayOfWeek = getDay(targetDate); // Use getDay() for integer (0-6)

        // Step 1: Find the provider's general availability for that day
        const providerSchedules = await db.query.providerAvailability.findMany({
            where: and(
                eq(providerAvailability.providerId, providerId),
                eq(providerAvailability.dayOfWeek, dayOfWeek)
            ),
        });

        if (providerSchedules.length === 0) {
            return []; // Provider does not work on this day.
        }
        
        // Step 2: Get existing appointments for the provider on that day
        const existingAppointments = await db
            .select({
                startTime: appointments.startTime,
                endTime: appointments.endTime,
            })
            .from(appointments)
            .where(
                and(
                    eq(appointments.providerId, providerId),
                    gte(appointments.startTime, startOfDay(targetDate)),
                    lt(appointments.startTime, endOfDay(targetDate))
                )
            );
        
        // For simplicity, let's assume a service duration. In a real app, this would be dynamic.
        const serviceDuration = 30; 
        const allAvailableSlots: string[] = [];

        // Step 3: Generate potential slots from all of the provider's schedules for the day
        for (const schedule of providerSchedules) {
            const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
            const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
            
            let potentialSlotStart = setMinutes(setHours(startOfDay(targetDate), startHour), startMinute);
            const scheduleEndTime = setMinutes(setHours(startOfDay(targetDate), endHour), endMinute);

            while (isBefore(potentialSlotStart, scheduleEndTime)) {
                const potentialSlotEnd = addMinutes(potentialSlotStart, serviceDuration);
                if (!isBefore(potentialSlotEnd, scheduleEndTime) && potentialSlotEnd.getTime() !== scheduleEndTime.getTime()) {
                    break;
                }

                // Step 4: Check for conflicts
                const isOverlapping = existingAppointments.some(booking => {
                    const bookingStart = booking.startTime;
                    const bookingEnd = booking.endTime;
                    return potentialSlotStart < bookingEnd && potentialSlotEnd > bookingStart;
                });

                if (!isOverlapping) {
                    allAvailableSlots.push(format(potentialSlotStart, 'HH:mm'));
                }
                
                potentialSlotStart = addMinutes(potentialSlotStart, 15); // Move to the next potential slot
            }
        }

        // Step 5: Sort and remove duplicates
        const uniqueSortedSlots = [...new Set(allAvailableSlots)].sort();
        
        return uniqueSortedSlots;

    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error(`Error fetching availability for provider ${providerId} on ${date}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        throw new ApiError(500, `Could not retrieve availability. Database error: ${errorMessage}`);
    }
}

async function getAdminAppointments(input: z.infer<typeof getAdminAppointmentsSchema>) {
    const { clinicId, page, per_page, sort, searchTerm } = input;
    const [sortKey, sortDirection] = sort.split('.') as [string, 'asc' | 'desc'];

    const providerProfiles = alias(profiles, 'provider_profiles');

    const whereClauses: (SQL | undefined)[] = [eq(appointments.clinicId, clinicId)];
    if (searchTerm) {
        const term = `%${searchTerm}%`;
        whereClauses.push(
            or(
                ilike(sql`COALESCE(TRIM(${profiles.firstName} || ' ' || ${profiles.lastName}), '')`, term),
                ilike(services.name, term),
                ilike(appointments.status, term)
            )
        );
    }

    const sortOptions = {
        'startTime': appointments.startTime,
        'user_full_name': sql`user_full_name`,
        'service_name': services.name,
        'status': appointments.status,
    };
    
    const orderBy = sortOptions[sortKey as keyof typeof sortOptions] ?? appointments.startTime;

    try {
        const dataQuery = db
            .select({
                ...getTableColumns(appointments),
                patient: {
                    fullName: sql<string>`COALESCE(TRIM(${profiles.firstName} || ' ' || ${profiles.lastName}), 'Not Set')`.as('user_full_name'),
                    contactNo: profiles.contactNo,
                },
                service: {
                    name: services.name,
                    price: services.price,
                    durationMinutes: services.durationMinutes,
                },
                provider: {
                    fullName: sql<string>`COALESCE(TRIM(${providerProfiles.firstName} || ' ' || ${providerProfiles.lastName}), 'N/A')`.as('provider_name'),
                },
                clinic: {
                    name: clinics.name,
                },
            })
            .from(appointments)
            .leftJoin(profiles, eq(appointments.patientId, profiles.clerkId))
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
            .leftJoin(providers, eq(appointments.providerId, providers.id))
            .leftJoin(providerProfiles, eq(providers.profileId, providerProfiles.clerkId))
            .where(and(...whereClauses))
            .orderBy(sortDirection === 'asc' ? asc(orderBy) : desc(orderBy))
            .limit(per_page)
            .offset((page - 1) * per_page);

        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(appointments)
            .leftJoin(profiles, eq(appointments.patientId, profiles.clerkId))
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .leftJoin(providers, eq(appointments.providerId, providers.id))
            .leftJoin(providerProfiles, eq(providers.profileId, providerProfiles.clerkId))
            .where(and(...whereClauses));
        
        const [data, totalRecordsResult] = await Promise.all([
            dataQuery,
            countQuery,
        ]);
        
        return {
            appointments: data,
            totalRecords: totalRecordsResult[0].count,
        };

    } catch (error) {
        console.error('Error fetching admin appointments:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        throw new ApiError(500, `Could not retrieve appointments. Database error: ${errorMessage}`);
    }
}

export const appointmentService = {
  getClinics,
  getServicesForClinic,
  getServiceAvailabilityForClinic,
  getProviderAvailability,
  getAdminAppointments,
};