import { Hono } from 'hono';      
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, doctors, services, doctorClinics, doctorServices, providerAvailability, appointments, dayOfWeekEnum, serviceCategories } from '../../../drizzle/schema';
import { and, eq, sql, inArray, SQL, asc } from 'drizzle-orm';
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
 * Returns a list of all active clinics.
 * Can be filtered by `serviceId` to find clinics that offer a specific service.
 */
publicRoutes.get('/clinics', zValidator('query', clinicsQuerySchema), async (c) => {
  const { serviceId } = c.req.valid('query');

  // If a serviceId is provided, find clinics that have a doctor who offers that service.
  if (serviceId) {
    // This subquery finds all doctor IDs who are linked to the specified service.
    const doctorsWithServiceSubQuery = db
      .select({ doctorId: doctorServices.doctorId })
      .from(doctorServices)
      .where(eq(doctorServices.serviceId, serviceId));

    // This subquery finds all clinic IDs that are linked to the doctors found above.
    const clinicsWithDoctorSubQuery = db
      .select({ clinicId: doctorClinics.clinicId })
      .from(doctorClinics)
      .where(inArray(doctorClinics.doctorId, doctorsWithServiceSubQuery));
    
    // Finally, select the clinics that match the IDs from the subquery.
    const filteredClinics = await db
      .select({
        id: clinics.id,
        name: clinics.name,
        address: clinics.address,
        // Add other fields you want to return
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
  
  // If no serviceId is provided, return all active clinics.
  const allActiveClinics = await db.select({
    id: clinics.id,
    name: clinics.name,
    address: clinics.address,
  }).from(clinics).where(eq(clinics.isActive, true));

  return c.json({ data: allActiveClinics });
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

        // Step 3: Get all booked appointments for the next 90 days.
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 90);

        const appointmentsResult = await db
            .select({
                // Truncate the timestamp to a date and count the occurrences
                date: sql<string>`DATE("appointment_time")`,
                count: sql<number>`count(id)::int`
            })
            .from(appointments)
            .where(and(
                eq(appointments.clinicId, clinicId),
                eq(appointments.serviceId, serviceId),
                sql`"appointment_time" BETWEEN ${format(today, 'yyyy-MM-dd')} AND ${format(futureDate, 'yyyy-MM-dd')}`,
                inArray(appointments.status, ['scheduled'])
            ))
            .groupBy(sql`DATE("appointment_time")`);
        
        // Step 4: Create a map of booked slots for easy lookup.
        const bookingsMap = new Map<string, number>();
        appointmentsResult.forEach(row => {
            // The date from SQL will be a Date object, format it correctly.
            const dateString = format(new Date(row.date), 'yyyy-MM-dd');
            bookingsMap.set(dateString, row.count);
        });

        // Step 5: Iterate through the next 90 days to find available ones.
        const availableDates: string[] = [];
        for (let i = 0; i < 90; i++) {
            const currentDate = new Date();
            currentDate.setDate(today.getDate() + i);
            const dateString = format(currentDate, 'yyyy-MM-dd');

            const bookedSlots = bookingsMap.get(dateString) || 0;
            
            // A date is available if the total possible slots are greater than the booked slots.
            if (totalSlotsPerDay > bookedSlots) {
                availableDates.push(dateString);
            }
        }

        return c.json({ data: availableDates.sort() });

    } catch (error) {
        console.error('Error fetching available dates:', error);
        return c.json({ error: 'Internal Server Error', message: 'Failed to fetch available dates' }, 500);
    }
});

/**
 * GET /public/availability
 * Calculates and returns available appointment slots for doctors.
 */
publicRoutes.get('/availability', zValidator('query', availabilityQuerySchema), async (c) => {
    const { serviceId, clinicId, date } = c.req.valid('query');
    const targetDate = parseISO(date);

    try {
        // Step 1: Get the service duration
        const serviceDetails = await db.query.services.findFirst({
            where: eq(services.id, serviceId),
            columns: { durationMinutes: true }
        });

        if (!serviceDetails || !serviceDetails.durationMinutes || serviceDetails.durationMinutes <= 0) {
            return c.json({ error: 'Service not found or has invalid duration' }, 404);
        }
        const slotDuration = serviceDetails.durationMinutes;

        // Step 2: Get all existing appointments for the specific service, clinic, and the selected date.
        const dayStart = startOfDay(targetDate);
        const dayEnd = endOfDay(targetDate);

        const existingAppointments = await db
            .select({ time: appointments.appointmentTime })
            .from(appointments)
            .where(and(
                eq(appointments.clinicId, clinicId),
                eq(appointments.serviceId, serviceId),
                sql`"appointment_time" BETWEEN ${dayStart.toISOString()} AND ${dayEnd.toISOString()}`,
                inArray(appointments.status, ['scheduled'])
            ));
        
        const bookedTimes = new Set(
            existingAppointments.map(a => format(new Date(a.time), "hh:mm a"))
        );

        // Step 3: Generate all potential slots between 9:00 AM and 5:00 PM and filter out booked ones.
        const availableSlots: string[] = [];
        const workdayStart = setHours(startOfDay(targetDate), 9); // 9:00 AM
        const workdayEnd = setHours(startOfDay(targetDate), 17);   // 5:00 PM
        
        let currentTime = workdayStart;
        while (isBefore(currentTime, workdayEnd)) {
            const timeString = format(currentTime, "hh:mm a");
            if (!bookedTimes.has(timeString)) {
                availableSlots.push(timeString);
            }
            currentTime = addMinutes(currentTime, slotDuration);
        }
        
        // The frontend expects the same doctor-centric structure, so we mock it
        // to avoid breaking the UI while delivering the core functionality.
        const mockDoctorId = "00000000-0000-0000-0000-000000000000";
        const mockDoctorName = "Any Available Provider";
        
        const responseData = availableSlots.length > 0 ? [{
            doctorId: mockDoctorId,
            doctorName: mockDoctorName,
            availableSlots: availableSlots,
        }] : [];
        
        return c.json({ data: responseData });

    } catch (error) {
        console.error('Error fetching availability:', error);
        return c.json({ error: 'Internal Server Error', message: 'Failed to fetch availability' }, 500);
    }
});

// GET /api/public/locations/provinces
publicRoutes.get('/locations/provinces', async (c) => {
    const provinces = await readPsgcFile('provinces.json');
    if (!provinces) {
        return c.json({ error: 'Could not load province data' }, 500);
    }
    return c.json(provinces);
});

// GET /api/public/locations/cities
publicRoutes.get('/locations/cities', async (c) => {
    const { provinceCode } = c.req.query();
    if (!provinceCode) {
        return c.json({ error: 'provinceCode query parameter is required' }, 400);
    }
    const allCities = await readPsgcFile('cities-municipalities.json');
    if (!allCities) {
        return c.json({ error: 'Could not load city data' }, 500);
    }
    const filteredCities = allCities.filter((city: any) => city.provinceCode === provinceCode);
    return c.json(filteredCities);
});

// GET /api/public/locations/barangays
publicRoutes.get('/locations/barangays', async (c) => {
    const { cityCode } = c.req.query();
    if (!cityCode) {
        return c.json({ error: 'cityCode query parameter is required' }, 400);
    }
    const allBarangays = await readPsgcFile('barangays.json');
    if (!allBarangays) {
        return c.json({ error: 'Could not load barangay data' }, 500);
    }
    const filteredBarangays = allBarangays.filter((brgy: any) => brgy.cityMunicipalityCode === cityCode);
    return c.json(filteredBarangays);
});

export default publicRoutes;
