import { Hono } from 'hono';      
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, doctors, services, doctorClinics, doctorServices, providerAvailability, appointments, dayOfWeekEnum } from '../../../drizzle/schema';
import { and, eq, sql, inArray } from 'drizzle-orm';
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
 * Returns a list of all active services.
 * Can be filtered by `clinicId` to find services offered at a specific clinic.
 */
publicRoutes.get('/services', zValidator('query', servicesQuerySchema), async (c) => {
    const { clinicId } = c.req.valid('query');

    // If a clinicId is provided, find services offered at that clinic.
    if (clinicId) {
        // This subquery finds all doctor IDs associated with the specified clinic.
        const doctorsInClinicSubQuery = db
            .select({ doctorId: doctorClinics.doctorId })
            .from(doctorClinics)
            .where(eq(doctorClinics.clinicId, clinicId));

        // This subquery finds all unique service IDs offered by those doctors.
        const servicesByDoctorsSubQuery = db
            .selectDistinct({ serviceId: doctorServices.serviceId })
            .from(doctorServices)
            .where(inArray(doctorServices.doctorId, doctorsInClinicSubQuery));
        
        // Finally, select the services that match the IDs from the subquery.
        const filteredServices = await db
            .select()
            .from(services)
            .where(
                and(
                    eq(services.isActive, true),
                    inArray(services.id, servicesByDoctorsSubQuery)
                )
            );
        return c.json({ data: filteredServices });
    }

    // If no clinicId is provided, return all active services.
    const activeServices = await db.select().from(services).where(eq(services.isActive, true));
    return c.json({ data: activeServices });
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
        // Step 1: Find all doctors for the given service and clinic.
        const doctorsForServiceQuery = db.select({ doctorId: doctorServices.doctorId }).from(doctorServices).where(eq(doctorServices.serviceId, serviceId));
        const doctorsForClinicQuery = db.select({ doctorId: doctorClinics.doctorId }).from(doctorClinics).where(eq(doctorClinics.clinicId, clinicId));

        const availableDoctorIds = await db
            .selectDistinct({ id: doctors.id })
            .from(doctors)
            .where(and(
                inArray(doctors.id, doctorsForServiceQuery),
                inArray(doctors.id, doctorsForClinicQuery),
                eq(doctors.isActive, true)
            ));

        if (availableDoctorIds.length === 0) {
            return c.json({ data: [] });
        }
        
        const doctorIds = availableDoctorIds.map(d => d.id);

        // Step 2: Fetch the unique working days for these doctors.
        const uniqueWorkingDays = await db
            .selectDistinct({ dayOfWeek: providerAvailability.dayOfWeek })
            .from(providerAvailability)
            .where(inArray(providerAvailability.doctorId, doctorIds));
        
        const workingDaysSet = new Set(uniqueWorkingDays.map(d => d.dayOfWeek));
        
        // Step 3: Iterate through the next 90 days and find matching dates.
        const availableDates: string[] = [];
        const today = startOfDay(new Date());
        for (let i = 0; i < 90; i++) {
            const currentDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            const dayOfWeek = format(currentDate, 'EEEE').toUpperCase() as (typeof dayOfWeekEnum.enumValues)[number];
            
            if (workingDaysSet.has(dayOfWeek)) {
                availableDates.push(format(currentDate, 'yyyy-MM-dd'));
            }
        }

        return c.json({ data: availableDates });

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
  const dayOfWeek = format(targetDate, 'EEEE').toUpperCase() as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

  try {
    // Step 1: Find all doctors associated with both the service and the clinic.
    const doctorsForService = db.select({ doctorId: doctorServices.doctorId }).from(doctorServices).where(eq(doctorServices.serviceId, serviceId));
    const doctorsForClinic = db.select({ doctorId: doctorClinics.doctorId }).from(doctorClinics).where(eq(doctorClinics.clinicId, clinicId));
    
    const availableDoctors = await db.select({ id: doctors.id, fullName: doctors.fullName })
      .from(doctors)
      .where(and(
        inArray(doctors.id, doctorsForService),
        inArray(doctors.id, doctorsForClinic)
      ));

    if (availableDoctors.length === 0) {
      return c.json({ data: [] });
    }

    const doctorIds = availableDoctors.map(d => d.id);

    // Step 2: Get the service duration and doctor's standard availability for the given day of the week.
    const [serviceDetails] = await db.select({ duration: services.durationMinutes }).from(services).where(eq(services.id, serviceId)).limit(1);
    const slotDuration = serviceDetails?.duration || 30; // Default to 30 mins if not found

    const availabilities = await db.select().from(providerAvailability).where(and(
      inArray(providerAvailability.doctorId, doctorIds),
      eq(providerAvailability.dayOfWeek, dayOfWeek)
    ));

    // Step 3: Get all existing appointments for these doctors on the target date.
    const existingAppointments = await db.select({ doctorId: appointments.doctorId, time: appointments.appointmentTime }).from(appointments).where(and(
      inArray(appointments.doctorId, doctorIds),
      sql`${appointments.appointmentTime} >= ${startOfDay(targetDate)}`,
      sql`${appointments.appointmentTime} <= ${endOfDay(targetDate)}`
    ));

    // Step 4: Calculate the final available slots for each doctor.
    const result = availableDoctors.map(doctor => {
      const doctorAvailability = availabilities.find(a => a.doctorId === doctor.id);
      if (!doctorAvailability) return { doctorId: doctor.id, doctorName: doctor.fullName, availableSlots: [] };

      const bookedSlots = existingAppointments
        .filter(a => a.doctorId === doctor.id)
        .map(a => new Date(a.time));

      const availableSlots: string[] = [];
      const [startHour, startMinute] = doctorAvailability.startTime.split(':').map(Number);
      const [endHour, endMinute] = doctorAvailability.endTime.split(':').map(Number);

      let currentTime = setSeconds(setMinutes(setHours(targetDate, startHour), startMinute), 0);
      const endTime = setSeconds(setMinutes(setHours(targetDate, endHour), endMinute), 0);

      while (isBefore(currentTime, endTime)) {
        const isBooked = bookedSlots.some(bookedSlot => isEqual(currentTime, bookedSlot));
        if (!isBooked) {
          availableSlots.push(format(currentTime, "HH:mm"));
        }
        currentTime = addMinutes(currentTime, slotDuration);
      }

      return {
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        availableSlots,
      };
    });

    return c.json({ data: result });

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
