import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { 
    clinics, 
    doctors, 
    services, 
    appointments, 
    dayOfWeekEnum, 
    serviceCategories, 
    clinicServices, 
    doctorServices, 
    doctorClinics, 
    providerAvailability 
} from '../../../drizzle/schema';
import { and, eq, sql, inArray, SQL, asc, getTableColumns } from 'drizzle-orm';
import { getDay, parseISO, format, startOfDay, endOfDay, setHours, setMinutes, setSeconds, isBefore, addMinutes, isEqual } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

const publicRoutes = new Hono();

// Validation schema for nearby clinics query
const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().optional().default(25000), // Default 25km radius
});

// Validation schema for the optional serviceId query
const clinicsQuerySchema = z.object({
  serviceId: z.string().uuid().optional(),
});

// Validation schema for services query
const servicesQuerySchema = z.object({
  clinicId: z.string().uuid().optional(),
});

// Validation schema for available dates
const availableDatesQuerySchema = z.object({
    clinicId: z.string().uuid({ message: "Invalid Clinic ID" }),
    serviceId: z.string().uuid({ message: "Invalid Service ID" }),
});

// Validation schema for the availability endpoint query
const availabilityQuerySchema = z.object({
  serviceId: z.string().uuid({ message: "Invalid Service ID" }),
  clinicId: z.string().uuid({ message: "Invalid Clinic ID" }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format. Use YYYY-MM-DD" }),
});

// --- NEW --- Schema for the universal clinic search
const searchClinicsSchema = z.object({
  q: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().optional().default(25000), // In meters
});

// Helper function to read PSGC data
const readPsgcFile = async (filename: string) => {
    // Correctly resolve the path from the project root
    const filepath = path.resolve(process.cwd(), 'src', 'data', 'psgc', filename);
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Failed to read or parse ${filename}:`, error);
        return null;
    }
};

/**
 * GET /public/clinics/nearby
 * Finds clinics within a specified radius of a geographic point.
 */
publicRoutes.get('/clinics/nearby', zValidator('query', nearbyQuerySchema), async (c) => {
  const { lat, lon, radius } = c.req.valid('query');

  try {
    const nearbyClinics = await db.execute(sql`
      SELECT id, name, address, ST_AsText(location) as location
      FROM ${clinics}
      WHERE "is_active" = true AND ST_DWithin(
        location,
        ST_MakePoint(${lon}, ${lat})::geography,
        ${radius}
      )
    `);

    return c.json(nearbyClinics);
  } catch (error) {
    console.error('Error fetching nearby clinics:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch nearby clinics' }, 500);
  }
});

/**
 * GET /public/clinics
 * Returns a list of all active clinics with their location data.
 */
publicRoutes.get('/clinics', zValidator('query', clinicsQuerySchema), async (c) => {
  const { serviceId } = c.req.valid('query');

  try {
    // If a serviceId is provided, find clinics that have a doctor who offers that service.
    if (serviceId) {
      const doctorsWithServiceSubQuery = db
        .select({ doctorId: doctorServices.doctorId })
        .from(doctorServices)
        .where(eq(doctorServices.serviceId, serviceId));

      const clinicsWithDoctorSubQuery = db
        .select({ clinicId: doctorClinics.clinicId })
        .from(doctorClinics)
        .where(inArray(doctorClinics.doctorId, doctorsWithServiceSubQuery));
      
      const filteredClinics = await db
        .select({
          ...getTableColumns(clinics),
          latitude: sql<number>`ST_Y(location::geometry)`,
          longitude: sql<number>`ST_X(location::geometry)`
        })
        .from(clinics)
        .where(
          and(
            eq(clinics.isActive, true),
            inArray(clinics.id, clinicsWithDoctorSubQuery)
          )
        );
      return c.json({ data: filteredClinics });
    }
    
    // Fallback to return all active clinics if no serviceId is provided
    const allClinics = await db.select({
      ...getTableColumns(clinics),
      latitude: sql<number>`ST_Y(location::geometry)`,
      longitude: sql<number>`ST_X(location::geometry)`
    }).from(clinics).where(eq(clinics.isActive, true));

    return c.json({ data: allClinics });
  } catch (error) {
    console.error("Failed to fetch public clinics:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

/**
 * GET /public/doctors
 * Returns a list of all active doctors.
 */
publicRoutes.get('/doctors', async (c) => {
  const activeDoctors = await db.select().from(doctors).where(eq(doctors.isActive, true));
  return c.json(activeDoctors);
});

 /**
     * GET /public/services
     * Returns a list of all active services, including their category.
     * Can be filtered by `clinicId` to find services offered at a specific clinic.
     */
    publicRoutes.get('/services', zValidator('query', servicesQuerySchema), async (c) => {
        const { clinicId } = c.req.valid('query');

        try {
            if (clinicId) {
                // If a clinicId is provided, perform a single JOIN-based query
                const servicesInClinic = await db.selectDistinct({
                    id: services.id,
                    name: services.name,
                    description: services.description,
                    price: services.price,
                    durationMinutes: services.durationMinutes,
                    isActive: services.isActive,
                    serviceCategory: {
                        id: serviceCategories.id,
                        name: serviceCategories.name,
                    }
                })
                .from(services)
                .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
                .innerJoin(doctorServices, eq(services.id, doctorServices.serviceId))
                .innerJoin(doctorClinics, eq(doctorServices.doctorId, doctorClinics.doctorId))
                .where(and(
                    eq(services.isActive, true),
                    eq(doctorClinics.clinicId, clinicId)
                ))
                .orderBy(asc(services.name));

                return c.json({ data: servicesInClinic });

            } else {
                // If no clinicId, return all active services (original logic)
                const allServices = await db.query.services.findMany({
                    where: eq(services.isActive, true),
                    with: {
                        serviceCategory: {
                            columns: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: [asc(services.name)],
                });
                return c.json({ data: allServices });
            }
        } catch (error) {
            console.error("Failed to fetch public services:", error);
            return c.json({ error: "Internal Server Error" }, 500);
        }
    });

/**
 * GET /public/service-categories
 * Returns a list of all service categories, ordered by name.
 */
publicRoutes.get('/service-categories', async (c) => {
  try {
    // Query the database for all service categories, ordering them by name
    const categories = await db.query.serviceCategories.findMany({
      orderBy: (serviceCategories, { asc }) => [asc(serviceCategories.name)],
    });

    console.log(`Backend: Successfully fetched ${categories.length} service categories.`);

    // The frontend expects a 'data' property, let's wrap it for consistency
    return c.json({ data: categories });

  } catch (error) {
    console.error("Backend Error: Failed to fetch service categories.", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

/**
 * GET /public/available-dates
 * Returns an array of dates within the next 90 days where at least one provider is available
 * for a specific service at a specific clinic.
 */
publicRoutes.get('/available-dates', zValidator('query', availableDatesQuerySchema), async (c) => {
    const { clinicId, serviceId } = c.req.valid('query');
    try {
        // --- FINAL IMPLEMENTATION ---
        // This logic correctly calculates availability based on a fixed 9 AM-5 PM
        // clinic schedule, as per user instruction.

        // Step 1: Get service duration to calculate total slots.
        const service = await db.query.services.findFirst({
            where: eq(services.id, serviceId),
            columns: { durationMinutes: true }
        });

        if (!service || !service.durationMinutes || service.durationMinutes <= 0) {
             // If service is not found or has an invalid duration, no dates can be available.
             return c.json({ data: [] });
        }
        const serviceDuration = service.durationMinutes;

        // Step 2: Calculate total possible slots in a 9 AM to 5 PM workday.
        const totalOperatingMinutes = (17 - 9) * 60; // 8 hours * 60 minutes/hour
        const totalSlotsPerDay = Math.floor(totalOperatingMinutes / serviceDuration);

        // Step 3: Find all doctors at the clinic who provide the service.
        const providers = await db.select({
            id: doctors.id
        }).from(doctors)
            .innerJoin(doctorClinics, eq(doctors.id, doctorClinics.doctorId))
            .innerJoin(doctorServices, eq(doctors.id, doctorServices.doctorId))
            .where(and(
                eq(doctorClinics.clinicId, clinicId),
                eq(doctorServices.serviceId, serviceId),
                eq(doctors.isActive, true)
            ));
        
        const providerIds = providers.map(p => p.id);
        if (providerIds.length === 0) {
            return c.json({ data: [] });
        }
        const totalCapacityPerDay = totalSlotsPerDay * providerIds.length;

        // Step 4: Get booked appointments count for each day for the next 90 days.
        const today = startOfDay(new Date());
        const futureDate = endOfDay(addMinutes(today, 90 * 24 * 60)); // 90 days from now

        const dailyBookings = await db.select({
            date: sql<string>`DATE(${appointments.appointmentTime})`,
            count: sql<number>`count(${appointments.id})`.mapWith(Number),
        }).from(appointments)
        .where(and(
            inArray(appointments.doctorId, providerIds),
            eq(appointments.clinicId, clinicId),
            sql`${appointments.appointmentTime} >= ${format(today, 'yyyy-MM-dd HH:mm:ss')}`,
            sql`${appointments.appointmentTime} < ${format(futureDate, 'yyyy-MM-dd HH:mm:ss')}`,
            sql`status != 'canceled_by_patient'`,
            sql`status != 'canceled_by_admin'`
        ))
        .groupBy(sql`DATE(${appointments.appointmentTime})`);

        // Step 5: Determine available dates.
        const availableDates:string[] = [];
        const bookingsMap = new Map(dailyBookings.map(b => [format(parseISO(b.date), 'yyyy-MM-dd'), b.count]));

        for (let i = 0; i < 90; i++) {
            const currentDate = addMinutes(today, i * 24 * 60);
            const dayOfWeek = getDay(currentDate); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue; // Skip weekends
            }

            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const bookedCount = bookingsMap.get(dateStr) || 0;

            if (bookedCount < totalCapacityPerDay) {
                availableDates.push(dateStr);
            }
        }
        return c.json({ data: availableDates });
    } catch (error) {
        console.error("Error fetching available dates:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * GET /public/availability/dates
 * ALIAS for /public/available-dates. The frontend was pointing to this path, so we're adding it
 * to avoid a 404 without requiring a frontend change.
 * Returns an array of dates within the next 90 days where at least one provider is available
 * for a specific service at a specific clinic.
 */
publicRoutes.get('/availability/dates', zValidator('query', availableDatesQuerySchema), async (c) => {
    const { clinicId, serviceId } = c.req.valid('query');
    try {
        // This logic is identical to the /available-dates endpoint.

        // Step 1: Get service duration to calculate total slots.
        const service = await db.query.services.findFirst({
            where: eq(services.id, serviceId),
            columns: { durationMinutes: true }
        });

        if (!service || !service.durationMinutes || service.durationMinutes <= 0) {
             return c.json({ data: [] });
        }
        const serviceDuration = service.durationMinutes;

        // Step 2: Calculate total possible slots in a 9 AM to 5 PM workday.
        const totalOperatingMinutes = (17 - 9) * 60; // 8 hours * 60 minutes/hour
        const totalSlotsPerDay = Math.floor(totalOperatingMinutes / serviceDuration);

        // Step 3: Find all doctors at the clinic who provide the service.
        const providers = await db.select({
            id: doctors.id
        }).from(doctors)
            .innerJoin(doctorClinics, eq(doctors.id, doctorClinics.doctorId))
            .innerJoin(doctorServices, eq(doctors.id, doctorServices.doctorId))
            .where(and(
                eq(doctorClinics.clinicId, clinicId),
                eq(doctorServices.serviceId, serviceId),
                eq(doctors.isActive, true)
            ));
        
        const providerIds = providers.map(p => p.id);
        if (providerIds.length === 0) {
            return c.json({ data: [] });
        }
        const totalCapacityPerDay = totalSlotsPerDay * providerIds.length;

        // Step 4: Get booked appointments count for each day for the next 90 days.
        const today = startOfDay(new Date());
        const futureDate = endOfDay(addMinutes(today, 90 * 24 * 60));

        const dailyBookings = await db.select({
            date: sql<string>`DATE(${appointments.appointmentTime})`,
            count: sql<number>`count(${appointments.id})`.mapWith(Number),
        }).from(appointments)
        .where(and(
            inArray(appointments.doctorId, providerIds),
            eq(appointments.clinicId, clinicId),
            sql`${appointments.appointmentTime} >= ${format(today, 'yyyy-MM-dd HH:mm:ss')}`,
            sql`${appointments.appointmentTime} < ${format(futureDate, 'yyyy-MM-dd HH:mm:ss')}`,
            sql`status != 'canceled_by_patient'`,
            sql`status != 'canceled_by_admin'`
        ))
        .groupBy(sql`DATE(${appointments.appointmentTime})`);

        // Step 5: Determine available dates.
        const availableDates:string[] = [];
        const bookingsMap = new Map(dailyBookings.map(b => [format(parseISO(b.date), 'yyyy-MM-dd'), b.count]));

        for (let i = 0; i < 90; i++) {
            const currentDate = addMinutes(today, i * 24 * 60);
            const dayOfWeek = getDay(currentDate);
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Skip weekends
                continue;
            }

            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const bookedCount = bookingsMap.get(dateStr) || 0;

            if (bookedCount < totalCapacityPerDay) {
                availableDates.push(dateStr);
            }
        }
        return c.json({ data: availableDates });
    } catch (error) {
        console.error("Error fetching available dates:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * GET /public/availability
 * New, simplified endpoint to get availability slots for a given service, clinic, and date.
 */
publicRoutes.get('/availability', zValidator('query', availabilityQuerySchema), async (c) => {
  const { serviceId, clinicId, date } = c.req.valid('query');
  const targetDate = startOfDay(parseISO(date));

  console.log(`[AVAILABILITY] Request for clinic: ${clinicId}, service: ${serviceId}, date: ${date}`);

  try {
    const service = await db.query.services.findFirst({
        where: eq(services.id, serviceId),
        columns: { durationMinutes: true }
    });

    if (!service || !service.durationMinutes) {
        console.error(`[AVAILABILITY] Service with ID ${serviceId} not found or has no duration.`);
        return c.json({ error: "Service not found or has no duration." }, 404);
    }
    const serviceDuration = service.durationMinutes;
    console.log(`[AVAILABILITY] Service duration: ${serviceDuration} minutes.`);

    const providersForServiceInClinic = await db.select({
        id: doctors.id
    }).from(doctors)
        .innerJoin(doctorClinics, eq(doctors.id, doctorClinics.doctorId))
        .innerJoin(doctorServices, eq(doctors.id, doctorServices.doctorId))
        .where(and(
            eq(doctorClinics.clinicId, clinicId),
            eq(doctorServices.serviceId, serviceId),
            eq(doctors.isActive, true)
        ));

    console.log(`[AVAILABILITY] Found ${providersForServiceInClinic.length} provider(s) for this service and clinic.`);

    if (providersForServiceInClinic.length === 0) {
        return c.json({ availableSlots: [], doctorsForSlot: {} });
    }
    const providerIds = providersForServiceInClinic.map(p => p.id);

    const bookedAppointments = await db.select({
        appointmentTime: appointments.appointmentTime,
        doctorId: appointments.doctorId,
    }).from(appointments)
    .where(and(
        inArray(appointments.doctorId, providerIds),
        eq(appointments.clinicId, clinicId),
        sql`${appointments.appointmentTime} >= ${format(startOfDay(targetDate), 'yyyy-MM-dd HH:mm:ss')}`,
        sql`${appointments.appointmentTime} < ${format(endOfDay(targetDate), 'yyyy-MM-dd HH:mm:ss')}`,
        sql`status != 'canceled_by_patient'`,
        sql`status != 'canceled_by_admin'`
    ));

    console.log(`[AVAILABILITY] Found ${bookedAppointments.length} booked appointments for the given providers on this day.`);

    const bookedDoctorSlots = new Set(bookedAppointments.map(a => `${format(parseISO(a.appointmentTime), 'HH:mm')}-${a.doctorId}`));
    
    console.log('[AVAILABILITY] Set of booked slots:', bookedDoctorSlots);

    const availableSlots: string[] = [];
    const doctorsPerSlot: Record<string, string[]> = {};

    let currentTime = setMinutes(setHours(targetDate, 9), 0);
    const endTime = setMinutes(setHours(targetDate, 17), 0);

    while (isBefore(currentTime, endTime)) {
        const timeSlotStr = format(currentTime, 'HH:mm');
        const availableDoctorsForSlot = [];

        for (const providerId of providerIds) {
            if (!bookedDoctorSlots.has(`${timeSlotStr}-${providerId}`)) {
                availableDoctorsForSlot.push(providerId);
            }
        }
        
        if (availableDoctorsForSlot.length > 0) {
            if (!doctorsPerSlot[timeSlotStr]) {
                 availableSlots.push(timeSlotStr);
                 doctorsPerSlot[timeSlotStr] = [];
            }
            doctorsPerSlot[timeSlotStr].push(...availableDoctorsForSlot);
        }
        currentTime = addMinutes(currentTime, serviceDuration);
    }
    
    console.log(`[AVAILABILITY] Final computed available slots: ${availableSlots.length}`, availableSlots);

    return c.json({
        availableSlots: availableSlots.sort(),
        doctorsForSlot: doctorsPerSlot
    });

  } catch (error) {
    console.error(`Error fetching availability for service ${serviceId} at clinic ${clinicId} on ${date}:`, error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});


/**
 * GET /public/psgc/provinces
 * Returns a list of all provinces from the PSGC data.
 */
publicRoutes.get('/psgc/provinces', async (c) => {
    const provinces = await readPsgcFile('provinces.json');
    if (!provinces) {
        return c.json({ error: "Could not load province data." }, 500);
    }
    return c.json(provinces);
});

/**
 * GET /public/psgc/cities-municipalities/:provinceCode
 * Returns a list of cities/municipalities for a given province code.
 */
publicRoutes.get('/psgc/cities-municipalities/:provinceCode', async (c) => {
    const { provinceCode } = c.req.param();
    const allCities = await readPsgcFile('cities-municipalities.json');
    if (!allCities) {
        return c.json({ error: "Could not load city/municipality data." }, 500);
    }
    const filteredCities = allCities.filter((city: any) => city.province_code === provinceCode);
    return c.json(filteredCities);
});

/**
 * GET /public/psgc/barangays/:cityMunicipalityCode
 * Returns a list of barangays for a given city/municipality code.
 */
publicRoutes.get('/psgc/barangays/:cityMunicipalityCode', async (c) => {
    const { cityMunicipalityCode } = c.req.param();
    const allBarangays = await readPsgcFile('barangays.json');
    if (!allBarangays) {
        return c.json({ error: "Could not load barangay data." }, 500);
    }
    const filteredBarangays = allBarangays.filter((bgy: any) => bgy.city_municipality_code === cityMunicipalityCode);
    return c.json(filteredBarangays);
});

/**
 * GET /public/search/clinics
 * Performs a universal search for clinics by text and/or location.
 */
publicRoutes.get('/search/clinics', zValidator('query', searchClinicsSchema), async (c) => {
    const { q, lat, lon, radius } = c.req.valid('query');

    const conditions: SQL[] = [eq(clinics.isActive, true)];
    let distanceSelection: any = sql`null`.as('distance_km');
    let orderBy: any = asc(clinics.name);

    if (q) {
        conditions.push(sql`${clinics.name} ILIKE ${'%' + q + '%'}`);
    }

    if (lat !== undefined && lon !== undefined) {
        const userPoint = sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`;
        distanceSelection = sql`ST_Distance(${userPoint}, ${clinics.location}) / 1000`.as('distance_km');
        orderBy = asc(sql`distance_km`);

        // If radius is provided, add a distance condition to the query
        if (radius) {
            conditions.push(sql`ST_DWithin(${clinics.location}, ${userPoint}, ${radius})`);
        }
    }

    try {
        const results = await db
            .select({
                id: clinics.id,
                name: clinics.name,
                address: clinics.address,
                phoneNumber: clinics.phoneNumber,
                logoUrl: clinics.logoUrl,
                isActive: clinics.isActive,
                location: clinics.location,
                distanceKm: distanceSelection,
            })
            .from(clinics)
            .where(and(...conditions))
            .orderBy(orderBy);
            
        return c.json({ data: results });
    } catch (error: any) {
        console.error("Error searching clinics:", error);
        return c.json({ error: 'Failed to search clinics', message: error.message }, 500);
    }
});

export default publicRoutes;
