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
    doctorServices, 
    doctorClinics, 
    providerAvailability 
} from '../../../drizzle/schema';
import { and, eq, sql, inArray, SQL, asc, getTableColumns, type AnyColumn, ne, gte, lt } from 'drizzle-orm';
import { getDay, parseISO, format, startOfDay, endOfDay, setHours, setMinutes, setSeconds, isBefore, addMinutes, isEqual } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
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

// --- NEW --- Schema for the universal clinic search
const searchClinicsSchema = z.object({
  q: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().optional().default(25000), // In meters
});

// --- NEW --- Schema for the universal clinic search
const universalSearchSchema = z.object({
    serviceId: z.string().uuid().optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lon: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().positive().optional(), // In meters
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
      // --- CORRECTED LOGIC ---
      // Use direct JOINs to efficiently find clinics offering a specific service.
      const filteredClinics = await db
        .selectDistinct({ // Use DISTINCT to avoid duplicate clinics
          ...getTableColumns(clinics),
          latitude: sql<number>`ST_Y(location::geometry)`,
          longitude: sql<number>`ST_X(location::geometry)`
        })
        .from(clinics)
        .innerJoin(doctorClinics, eq(clinics.id, doctorClinics.clinicId))
        .innerJoin(doctorServices, eq(doctorClinics.doctorId, doctorServices.doctorId))
        .where(
          and(
            eq(clinics.isActive, true),
            eq(doctorServices.serviceId, serviceId)
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
 * GET /public/clinics/:id
 * Fetches a single clinic by its ID, including a list of all services offered.
 */
publicRoutes.get('/clinics/:id', zValidator('param', z.object({ id: z.string().uuid() })), async (c) => {
    const { id } = c.req.valid('param');

    try {
        // Step 1: Fetch the clinic details
        const clinicDetails = await db.query.clinics.findFirst({
            where: eq(clinics.id, id),
        });

        if (!clinicDetails) {
            return c.json({ error: "Clinic not found" }, 404);
        }

        // Step 2: Fetch all services offered at this clinic
        const clinicServicesList = await db.selectDistinct({
            id: services.id,
            name: services.name,
            description: services.description,
            price: services.price,
            durationMinutes: services.durationMinutes,
        })
        .from(services)
        .innerJoin(doctorServices, eq(services.id, doctorServices.serviceId))
        .innerJoin(doctorClinics, eq(doctorServices.doctorId, doctorClinics.doctorId))
        .where(and(
            eq(doctorClinics.clinicId, id),
            eq(services.isActive, true)
        ))
        .orderBy(asc(services.name));

        // Step 3: Combine into the final response shape
        const response = {
            ...clinicDetails,
            services: clinicServicesList,
        };

        return c.json(response);

    } catch (error) {
        console.error(`Failed to fetch details for clinic ${id}:`, error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * NEW: GET /public/clinics/:id/appointments
 * Fetches all scheduled appointments for a specific clinic, with an optional date range.
 * This is the simplified endpoint to provide raw booking data to the frontend.
 */
publicRoutes.get('/clinics/:id/appointments', 
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('query', z.object({ 
        // startDate and endDate should be ISO 8601 strings (e.g., "2024-08-01T00:00:00.000Z")
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
    })),
    async (c) => {
        const { id: clinicId } = c.req.valid('param');
        const { startDate, endDate } = c.req.valid('query');

        try {
            const queryConditions: (SQL | undefined)[] = [
                eq(appointments.clinicId, clinicId),
                eq(appointments.status, 'scheduled')
            ];

            if (startDate) {
                queryConditions.push(gte(appointments.appointmentTime, startDate));
            }
            if (endDate) {
                queryConditions.push(lt(appointments.appointmentTime, endDate));
            }

            const clinicAppointments = await db.select({
                id: appointments.id,
                appointmentTime: appointments.appointmentTime,
                serviceId: appointments.serviceId,
                doctorId: appointments.doctorId,
            })
            .from(appointments)
            .where(and(...queryConditions))
            .orderBy(asc(appointments.appointmentTime));

            return c.json({ data: clinicAppointments });

        } catch (error) {
            console.error(`Failed to fetch appointments for clinic ${clinicId}:`, error);
            return c.json({ error: "Internal Server Error", message: "Could not fetch appointments." }, 500);
        }
    }
);

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
        console.log(`--- Backend /api/public/services ---`);
        console.log(`Received request with clinicId: ${clinicId}`);

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

                console.log(`Found ${servicesInClinic.length} services for clinicId ${clinicId}.`);
                console.log(`Returning services:`, JSON.stringify(servicesInClinic, null, 2));
                console.log(`------------------------------------`);
                return c.json({ data: servicesInClinic });

            } else {
                // --- CORRECTED LOGIC for fetching ALL services ---
                // If no clinicId, return all active services, ensuring those without
                // a category are included by using a LEFT JOIN.
                const allServices = await db.select({
                        ...getTableColumns(services),
                        serviceCategory: {
                            id: serviceCategories.id,
                            name: serviceCategories.name,
                        }
                    })
                    .from(services)
                    .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
                    .where(eq(services.isActive, true))
                    .orderBy(asc(services.name));

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

    // This endpoint should return the array directly for the frontend service to consume.
    return c.json(categories);

  } catch (error) {
    console.error("Backend Error: Failed to fetch service categories.", error);
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
 * A powerful, unified endpoint for finding clinics.
 * Can filter by service and/or sort by distance from a point.
 */
publicRoutes.get('/search/clinics', zValidator('query', universalSearchSchema), async (c) => {
    const { serviceId, lat, lon, radius } = c.req.valid('query');
    console.log(`[Clinic Search] Received params: serviceId=${serviceId}, lat=${lat}, lon=${lon}, radius=${radius}`);

    try {
        const hasLocation = lat !== undefined && lon !== undefined;
        let distanceCalculation: SQL | undefined = undefined;

        // Define the distance calculation if location is provided
        if (hasLocation) {
            distanceCalculation = sql<number>`ST_Distance(
                ${clinics.location}, 
                ST_MakePoint(${lon}, ${lat})::geography
            )`;
        }
        
        // Base columns to select, including latitude and longitude
        const columnsToSelect: { [key: string]: any } = {
            ...getTableColumns(clinics),
            latitude: sql<number>`ST_Y(location::geometry)`,
            longitude: sql<number>`ST_X(location::geometry)`
        };

        // If location is provided, add the distance calculation to the select
        if (distanceCalculation) {
            columnsToSelect.distance = distanceCalculation;
        }

        // Start building the query
        let query = db.select(columnsToSelect).from(clinics).$dynamic();

        const conditions: SQL[] = [eq(clinics.isActive, true)];

        // Conditionally add filtering by serviceId
        if (serviceId) {
            // --- CORRECTED LOGIC ---
            // Create a single, more efficient subquery to find all clinic IDs
            // that are associated with the given serviceId.
            const clinicIdsWithService = db
                .selectDistinct({ clinicId: doctorClinics.clinicId })
                .from(doctorServices)
                .innerJoin(doctorClinics, eq(doctorServices.doctorId, doctorClinics.doctorId))
                .where(eq(doctorServices.serviceId, serviceId));
            
            conditions.push(inArray(clinics.id, clinicIdsWithService));
        }

        // Conditionally add radius filtering
        if (hasLocation && radius) {
            conditions.push(sql`ST_DWithin(
                ${clinics.location},
                ST_MakePoint(${lon}, ${lat})::geography,
                ${radius}
            )`);
        }

        query = query.where(and(...conditions));

        // Conditionally add sorting by distance, using the raw calculation
        if (distanceCalculation) {
            query = query.orderBy(distanceCalculation);
        } else {
            query = query.orderBy(asc(clinics.name));
        }

        const results = await query;
        return c.json({ data: results });

    } catch (error) {
        console.error("Clinic search query failed:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// Helper function to convert "HH:MM:SS" to a Date object for a specific date
function timeToDate(timeStr: string, date: Date): Date {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, seconds, 0);
    return newDate;
}

export default publicRoutes;

