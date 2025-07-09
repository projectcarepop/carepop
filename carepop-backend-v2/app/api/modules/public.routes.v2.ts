import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { 
    clinics, 
    doctors, 
    services, 
    dayOfWeekEnum, 
    serviceCategories, 
    doctorClinics, 
    profiles,
    doctorSchedules,
    doctorAvailabilityOverrides,
    clinicOverrides,
    doctorClinicServices,
    reviews,
    appointments,
    clinicServices
} from '../../../drizzle/schema';
import { and, eq, sql, inArray, SQL, asc, getTableColumns, type AnyColumn, ne, gte, lt, notInArray, ilike } from 'drizzle-orm';
import { getDay, parseISO, format, startOfDay, endOfDay, setHours, setMinutes, setSeconds, isBefore, addMinutes, isEqual, eachDayOfInterval } from 'date-fns';
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
  categoryId: z.string().uuid().optional(),
  q: z.string().optional(),
});

const availableSlotsSchema = z.object({
  serviceId: z.string().uuid(),
  clinicId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" }),
});

const availableDaysSchema = z.object({
  serviceId: z.string().uuid(),
  clinicId: z.string().uuid(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(new Date().getFullYear()),
});

// Helper function to read PSGC data
const readPsgcFile = async (filename: string) => {
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
 * GET /public/clinics
 * Returns a list of all active clinics with their location data.
 */
publicRoutes.get('/clinics', zValidator('query', clinicsQuerySchema), async (c) => {
  const { serviceId } = c.req.valid('query');

  try {
    if (serviceId) {
      const filteredClinics = await db
        .selectDistinct({
          ...getTableColumns(clinics),
        })
        .from(clinics)
        .innerJoin(doctorClinics, eq(clinics.id, doctorClinics.clinicId))
        .innerJoin(doctorClinicServices, eq(doctorClinics.doctorId, doctorClinicServices.doctorId))
        .where(
          and(
            eq(clinics.isActive, true),
            eq(doctorClinicServices.serviceId, serviceId)
          )
        );
      return c.json({ data: filteredClinics });
    }
    
    const allClinics = await db.select().from(clinics).where(eq(clinics.isActive, true));

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
        const clinicDetails = await db.query.clinics.findFirst({
            where: eq(clinics.id, id),
            with: {
                clinicServices: {
                    with: {
                        service: true,
                    }
                }
            }
        });

        if (!clinicDetails) {
            return c.json({ message: 'Clinic not found' }, 404);
        }

        const transformedServices = clinicDetails.clinicServices.map(cs => cs.service);

        const response = {
            ...clinicDetails,
            services: transformedServices,
        };

        return c.json(response);

    } catch (error) {
        console.error('Error fetching clinic details:', error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * GET /public/services
 * Retrieves a list of all active services. Can be filtered by clinic or category.
 */
publicRoutes.get('/services', zValidator('query', servicesQuerySchema), async (c) => {
    const { clinicId, categoryId, q } = c.req.valid('query');
    try {
        let conditions: (SQL | undefined)[] = [eq(services.isActive, true)];

        if (categoryId) {
            conditions.push(eq(services.categoryId, categoryId));
        }
        
        if (q) {
            conditions.push(ilike(services.name, `%${q}%`));
        }

        if (clinicId) {
            const clinicServiceIds = db.selectDistinct({ serviceId: doctorClinicServices.serviceId })
                .from(doctorClinicServices)
                .innerJoin(doctorClinics, eq(doctorClinicServices.doctorId, doctorClinics.doctorId))
                .where(eq(doctorClinics.clinicId, clinicId));

            conditions.push(inArray(services.id, clinicServiceIds));
        }

        const servicesList = await db.select().from(services).where(and(...conditions)).orderBy(asc(services.name));
        return c.json({ data: servicesList });
    } catch (error) {
        console.error("Failed to fetch services:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * GET /public/service-categories
 * Retrieves a list of all service categories.
 */
publicRoutes.get('/service-categories', async (c) => {
    try {
        const categories = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.name));
        return c.json({ data: categories });
    } catch (error) {
        console.error("Failed to fetch service categories:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * GET /public/services/:serviceId/doctors
 * Retrieves all doctors who provide a specific service, optionally filtered by a clinic.
 */
publicRoutes.get(
    '/services/:serviceId/doctors',
    zValidator('param', z.object({ serviceId: z.string().uuid() })),
    zValidator('query', z.object({ clinicId: z.string().uuid().optional() })),
    async (c) => {
        const { serviceId } = c.req.valid('param');
        const { clinicId } = c.req.valid('query');

        try {
            const conditions: (SQL | undefined)[] = [
                eq(doctorClinicServices.serviceId, serviceId)
            ];

            if (clinicId) {
                conditions.push(eq(doctorClinicServices.clinicId, clinicId));
            }

            const query = db
                .selectDistinct({
                    id: doctors.id,
                    fullName: doctors.fullName,
                    specialtyText: doctors.specialtyText,
                    avatarUrl: doctors.avatarUrl,
                })
                .from(doctors)
                .innerJoin(doctorClinicServices, eq(doctors.id, doctorClinicServices.doctorId))
                .where(and(...conditions));
            
            const serviceDoctors = await query;

            return c.json({ data: serviceDoctors });
        } catch (error) {
            console.error(`Failed to fetch doctors for service ${serviceId}:`, error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
);

// NOTE: The availability endpoints below are complex and were not part of this refactor.
// They are preserved in their original state.

type TimeSlot = [Date, Date];

function mergeSlots(slots: TimeSlot[]): TimeSlot[] {
    if (slots.length <= 1) return slots;
    slots.sort((a, b) => a[0].getTime() - b[0].getTime());

    const merged: TimeSlot[] = [slots[0]];
    for (let i = 1; i < slots.length; i++) {
        const last = merged[merged.length - 1];
        const current = slots[i];
        if (current[0].getTime() <= last[1].getTime()) {
            last[1] = new Date(Math.max(last[1].getTime(), current[1].getTime()));
        } else {
            merged.push(current);
        }
    }
    return merged;
}

function addSlot(slots: TimeSlot[], newSlot: TimeSlot): TimeSlot[] {
    slots.push(newSlot);
    return mergeSlots(slots);
}

function subtractSlot(slots: TimeSlot[], slotToSubtract: TimeSlot): TimeSlot[] {
    const [subStart, subEnd] = slotToSubtract;
    let newSlots: TimeSlot[] = [];

    for (const slot of slots) {
        const [start, end] = slot;
        if (end <= subStart || start >= subEnd) {
            newSlots.push(slot);
            continue;
        }
        if (start >= subStart && end <= subEnd) continue;
        if (start < subStart && end > subEnd) {
            newSlots.push([start, subStart]);
            newSlots.push([subEnd, end]);
            continue;
        }
        if (start < subStart && end > subStart) {
            newSlots.push([start, subStart]);
            continue;
        }
        if (start < subEnd && end > subEnd) {
            newSlots.push([subEnd, end]);
            continue;
        }
    }
    return newSlots;
}

function timeToDate(timeStr: string, date: Date): Date {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return setSeconds(setMinutes(setHours(startOfDay(date), hours), minutes), seconds);
}

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

async function calculateAvailableSlots(
    db: any,
    doctorId: string, 
    serviceId: string, 
    clinicId: string,
    startDate: Date, 
    endDate: Date
) {
    const service = await db.query.services.findFirst({
        where: eq(services.id, serviceId),
        columns: { durationMinutes: true }
    });

    if (!service) {
        throw new Error('Service not found');
    }
    const { durationMinutes } = service;

    const uniqueDaysOfWeek = [...new Set(eachDayOfInterval({ start: startDate, end: endDate }).map(d => getDay(d)))];

    const schedules = await db.select()
        .from(doctorSchedules)
        .where(and(eq(doctorSchedules.doctorId, doctorId), inArray(doctorSchedules.dayOfWeek, uniqueDaysOfWeek)));

    const bookedAppointments = await db.select({
        appointmentTime: appointments.appointmentTime,
        durationMinutes: services.durationMinutes
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.clinicId, clinicId),
        gte(appointments.appointmentTime, format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
        lt(appointments.appointmentTime, format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
        inArray(appointments.status, ['scheduled', 'completed'])
    ));

    const clinicNotAvailableOverrides = await db.select()
        .from(clinicOverrides)
        .where(and(
            eq(clinicOverrides.clinicId, clinicId),
            eq(clinicOverrides.isAvailable, false),
            gte(clinicOverrides.endDateTime, format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
            lt(clinicOverrides.startDateTime, format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))
        ));

    const doctorOverrides = await db.select()
        .from(doctorAvailabilityOverrides)
        .where(and(
            eq(doctorAvailabilityOverrides.doctorId, doctorId),
            gte(doctorAvailabilityOverrides.endDateTime, format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
            lt(doctorAvailabilityOverrides.startDateTime, format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))
        ));

    let potentialSlots: TimeSlot[] = [];
    for (const day of eachDayOfInterval({ start: startDate, end: endDate })) {
        const dayOfWeek = getDay(day);
        const relevantSchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

        for (const schedule of relevantSchedules) {
            potentialSlots.push([timeToDate(schedule.startTime, day), timeToDate(schedule.endTime, day)]);
        }
    }
    potentialSlots = mergeSlots(potentialSlots);

    const availableDoctorOverrides = doctorOverrides.filter(o => o.isAvailable);
    for (const override of availableDoctorOverrides) {
        potentialSlots = addSlot(potentialSlots, [parseISO(override.startDateTime), parseISO(override.endDateTime)]);
    }

    const unavailableDoctorOverrides = doctorOverrides.filter(o => !o.isAvailable);
    for (const override of unavailableDoctorOverrides) {
        potentialSlots = subtractSlot(potentialSlots, [parseISO(override.startDateTime), parseISO(override.endDateTime)]);
    }
    for (const override of clinicNotAvailableOverrides) {
        potentialSlots = subtractSlot(potentialSlots, [parseISO(override.startDateTime), parseISO(override.endDateTime)]);
    }
    for (const appt of bookedAppointments) {
        const apptStartTime = parseISO(appt.appointmentTime);
        const apptEndTime = addMinutes(apptStartTime, appt.durationMinutes);
        potentialSlots = subtractSlot(potentialSlots, [apptStartTime, apptEndTime]);
    }

    const finalSlots: string[] = [];
    for (const slot of potentialSlots) {
        let currentTime = slot[0];
        while (isBefore(addMinutes(currentTime, durationMinutes), addMinutes(slot[1], 1))) {
            if (isEqual(currentTime, slot[0]) || isBefore(currentTime, slot[1])) {
                finalSlots.push(format(currentTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
            }
            currentTime = addMinutes(currentTime, 15); // Assume 15-minute increments for booking starts
        }
    }
    return finalSlots.filter((slot, index, self) => self.indexOf(slot) === index);
}


publicRoutes.get('/doctors/:id/available-days', 
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('query', availableDaysSchema), async (c) => {
        const { id: doctorId } = c.req.valid('param');
        const { serviceId, clinicId, month, year } = c.req.valid('query');

        const startDate = startOfDay(new Date(year, month - 1, 1));
        const endDate = endOfDay(new Date(year, month, 0));

        try {
            const allSlots = await calculateAvailableSlots(db, doctorId, serviceId, clinicId, startDate, endDate);
            
            const uniqueDays = [...new Set(allSlots.map(slot => format(parseISO(slot), 'yyyy-MM-dd')))];
            
            return c.json({ data: uniqueDays });
        } catch (error) {
            console.error('Error calculating available days:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
);

publicRoutes.get('/doctors/:id/available-slots',
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('query', availableSlotsSchema), async (c) => {
        const { id: doctorId } = c.req.valid('param');
        const { serviceId, clinicId, date } = c.req.valid('query');

        const requestedDate = parseISO(date);
        const startDate = startOfDay(requestedDate);
        const endDate = endOfDay(requestedDate);

        try {
            const finalSlots = await calculateAvailableSlots(db, doctorId, serviceId, clinicId, startDate, endDate);
            return c.json({ data: finalSlots });
        } catch (error) {
            console.error('Error fetching available slots:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }
);

// PSGC Endpoints
publicRoutes.get('/psgc/provinces', async (c) => {
    const provinces = await readPsgcFile('provinces.json');
    if (!provinces) return c.json({ error: 'Failed to load province data' }, 500);
    return c.json(provinces);
});

publicRoutes.get('/psgc/cities-municipalities', async (c) => {
    const cities = await readPsgcFile('cities-municipalities.json');
    if (!cities) return c.json({ error: 'Failed to load city/municipality data' }, 500);
    return c.json(cities);
});

publicRoutes.get('/psgc/barangays', async (c) => {
    const barangays = await readPsgcFile('barangays.json');
    if (!barangays) return c.json({ error: 'Failed to load barangay data' }, 500);
    return c.json(barangays);
});

export default publicRoutes; 