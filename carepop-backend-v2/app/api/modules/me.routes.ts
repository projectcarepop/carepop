import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sql, desc, getTableColumns } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, doctors, clinics, services, medicalRecords, recordDoctorNotes, recordPrescriptions, recordDocuments, profiles, healthLogs, menstrualLogs, doctorSchedules, clinicOverrides, doctorAvailabilityOverrides } from '../../../drizzle/schema';
import { and, eq, gte, lte, or, isNull, not, asc, notInArray, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { authMiddleware, AuthEnv } from '../middleware/auth';
import { generativeModel } from '../../../src/services/vertex-ai';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { differenceInHours, isSameDay, eachDayOfInterval, format, startOfDay, endOfDay, addMinutes } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { createClient } from '@supabase/supabase-js';

// Define types from schema for local use
type Appointment = InferSelectModel<typeof appointments>;
type MedicalRecord = InferSelectModel<typeof medicalRecords>;

const createAppointmentSchema = z.object({
  clinic_id: z.string().uuid(),
  service_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  appointment_time: z.string().datetime(),
  reason_for_visit: z.string().optional(),
});

const meRoutes = new Hono<AuthEnv>();

// Apply auth middleware to all routes in this module
meRoutes.use('*', authMiddleware);

// Copied from public.routes.ts to be used for server-side validation.
// A future refactor could move this to a shared /lib or /services directory.
async function calculateAvailableSlots(
    db: any,
    doctorId: string, 
    serviceId: string, 
    clinicId: string,
    startDate: Date, 
    endDate: Date
) {
    // 1. Fetch service duration. The clinic is now provided directly.
    const service = await db.query.services.findFirst({ 
        where: eq(services.id, serviceId), 
        columns: { durationMinutes: true } 
    });

    if (!service) throw new Error('Service not found');
    
    const slotDuration = service.durationMinutes;

    // 2. Fetch all necessary availability data in parallel
    const [
        schedules,
        doctorOverrides,
        clinicHolidays,
        bookedAppointments
    ] = await Promise.all([
        db.query.doctorSchedules.findMany({ where: eq(doctorSchedules.doctorId, doctorId) }),
        db.query.doctorAvailabilityOverrides.findMany({ where: and(
            eq(doctorAvailabilityOverrides.doctorId, doctorId), 
            gte(doctorAvailabilityOverrides.endDateTime, startDate.toISOString()), 
            lt(doctorAvailabilityOverrides.startDateTime, endDate.toISOString())
        ) }),
        db.query.clinicOverrides.findMany({ where: and(
            eq(clinicOverrides.clinicId, clinicId),
            eq(clinicOverrides.isAvailable, false), // Only fetch holidays/closures
            gte(clinicOverrides.endDateTime, startDate.toISOString()),
            lt(clinicOverrides.startDateTime, endDate.toISOString())
        )}),
        db.query.appointments.findMany({ where: and(
            eq(appointments.doctorId, doctorId), 
            notInArray(appointments.status, ['canceled_by_patient', 'canceled_by_admin', 'no_show']),
            gte(appointments.appointmentTime, startDate.toISOString()), 
            lt(appointments.appointmentTime, endDate.toISOString())
        ), columns: { appointmentTime: true } })
    ]);
    
    const availableSlots: Date[] = [];
    const interval = { start: startOfDay(startDate), end: endOfDay(endDate) };

    // 3. Iterate through each day in the requested range
    for (const day of eachDayOfInterval(interval)) {
        const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
        const yyyy_mm_dd = format(day, 'yyyy-MM-dd');

        // CHECK 1: Is the entire day a clinic holiday?
        const isClinicHoliday = clinicHolidays.some((h: { startDateTime: string | number | Date; endDateTime: string | number | Date; }) => day >= startOfDay(new Date(h.startDateTime)) && day < endOfDay(new Date(h.endDateTime)));
        if (isClinicHoliday) continue;

        // CHECK 2: Does the doctor have a non-availability override for this day?
        const doctorDayOff = doctorOverrides.find((o: { isAvailable: any; startDateTime: string | number | Date; endDateTime: string | number | Date; }) => !o.isAvailable && day >= startOfDay(new Date(o.startDateTime)) && day < endOfDay(new Date(o.endDateTime)));
        if (doctorDayOff) continue;
        
        // CHECK 3: Find the recurring schedule for this day of the week
        const dailySchedule = schedules.find((s: { dayOfWeek: number; }) => s.dayOfWeek === dayOfWeek);
        if (!dailySchedule) continue;

        // Generate potential slots based on the recurring schedule
        const timeZone = 'Asia/Manila';
        let potentialSlotStart = zonedTimeToUtc(`${yyyy_mm_dd}T${dailySchedule.startTime}`, timeZone);
        const scheduleEnd = zonedTimeToUtc(`${yyyy_mm_dd}T${dailySchedule.endTime}`, timeZone);

        while (potentialSlotStart < scheduleEnd) {
            const potentialSlotEnd = addMinutes(potentialSlotStart, slotDuration);

            if (potentialSlotEnd > scheduleEnd) {
                break; // Don't create a slot that exceeds the doctor's schedule
            }

            // CHECK 4: Is the slot in the past?
            if (potentialSlotStart < new Date()) {
                potentialSlotStart = addMinutes(potentialSlotStart, slotDuration);
                continue;
            }

            // CHECK 5: Does the slot overlap with a booked appointment?
            const conflictingAppointment = bookedAppointments.find((appt: { appointmentTime: string | number | Date; }) => {
                const apptStart = new Date(appt.appointmentTime);
                const apptEnd = addMinutes(apptStart, slotDuration);
                // Check for overlap: (StartA < EndB) and (EndA > StartB)
                return potentialSlotStart < apptEnd && potentialSlotEnd > apptStart;
            });

            if (conflictingAppointment) {
                const conflictEnd = addMinutes(new Date(conflictingAppointment.appointmentTime), slotDuration);
                potentialSlotStart = new Date(conflictEnd.getTime()); // Jump to the end of the conflicting appointment
                continue;
            }

            // CHECK 6: Does the slot overlap with a doctor's non-availability override?
            const conflictingOverride = doctorOverrides.find((o: { isAvailable: any; startDateTime: string | number | Date; endDateTime: string | number | Date; }) => 
                !o.isAvailable && potentialSlotStart < new Date(o.endDateTime) && potentialSlotEnd > new Date(o.startDateTime)
            );

            if (conflictingOverride) {
                potentialSlotStart = new Date(conflictingOverride.endDateTime); // Jump to the end of the override period
                continue;
            }

            // If all checks pass, it's a valid slot
            availableSlots.push(new Date(potentialSlotStart));
            
            // Move to the next slot
            potentialSlotStart = addMinutes(potentialSlotStart, slotDuration);
        }
    }
    
    return availableSlots;
}

/**
 * GET /me/profile
 * Fetches the profile for the authenticated user.
 */
meRoutes.get('/profile', async (c) => {
  const user = c.get('user');
  
  try {
    const [userProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /me/appointments
 * Fetches all appointments for the authenticated user, including related details.
 */
meRoutes.get('/appointments', async (c) => {
  const user = c.get('user');
  try {
    // Bypassing the Drizzle relational query bug with a simplified raw SQL query.
    // We are dropping the problematic doctor join as you suggested.
    const query = sql`
      SELECT
        a.id,
        a.appointment_time as "appointmentTime",
        a.status,
        s.name as "serviceName",
        c.name as "clinicName"
      FROM
        appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN clinics c ON a.clinic_id = c.id
      WHERE
        a.patient_id = ${user.id}
      ORDER BY
        a.appointment_time DESC;
    `;
    
    const userAppointments = await db.execute(query);

    // Reshape the data for the frontend, stubbing the doctor name.
    const transformedAppointments = userAppointments.map((appt: any) => ({
      id: appt.id,
      appointmentTime: appt.appointmentTime,
      status: appt.status,
      service: { name: appt.serviceName || 'Unknown Service' },
      clinic: { name: appt.clinicName || 'Unknown Clinic' },
      doctor: { fullName: 'Dr. Placeholder' }, // Provide a placeholder as discussed.
    }));

    return c.json({ appointments: transformedAppointments });
  } catch (error) {
    console.error("Error during raw SQL appointment fetch:", error);
    return c.json({ error: "Internal Server Error during raw SQL fetch" }, 500);
  }
});

/**
 * GET /me/records
 * Fetches all medical records for the authenticated user by querying through their appointments.
 * This is the new, correct implementation for the dashboard.
 */
meRoutes.get('/records', async (c) => {
  const user = c.get('user');

  try {
    const userAppointmentsWithRecords: (Appointment & {
        medicalRecords: MedicalRecord[];
        doctor: { fullName: string | null; } | null;
        clinic: { name: string; } | null;
        service: { name: string; } | null;
    })[] = await db.query.appointments.findMany({
        where: eq(appointments.patientId, user.id),
        with: {
            medicalRecords: true, // Fetch all related medical records
            doctor: {
                columns: { fullName: true }
            },
            clinic: {
                columns: { name: true }
            },
            service: {
                columns: { name: true }
            },
        },
        orderBy: (appointments, { desc }) => [desc(appointments.appointmentTime)]
    });

    // The frontend expects a flat list of records, not appointments.
    // We will transform the data to match the required `{ records: [...] }` shape.
    const allRecords = userAppointmentsWithRecords.flatMap(appt => 
        appt.medicalRecords.map((record: MedicalRecord) => ({
            ...record,
            // Attach the appointment details to each record for context
            appointment: {
                id: appt.id,
                appointmentTime: appt.appointmentTime,
                doctor: appt.doctor,
                clinic: appt.clinic,
                service: appt.service,
            }
        }))
    );

    // Fetch details for each medical record
    const recordsWithDetails = await Promise.all(
        allRecords.map(async (record) => {
            let details = null;
            
            switch (record.recordType) {
                case 'DOCTOR_NOTE':
                    const [noteDetails] = await db.select()
                        .from(recordDoctorNotes)
                        .where(eq(recordDoctorNotes.recordId, record.id));
                    details = noteDetails;
                    break;
                case 'PRESCRIPTION':
                    const [prescriptionDetails] = await db.select()
                        .from(recordPrescriptions)
                        .where(eq(recordPrescriptions.recordId, record.id));
                    details = prescriptionDetails;
                    break;
                case 'CLINICAL_DOCUMENT':
                case 'LAB_RESULT':
                    const [documentDetails] = await db.select()
                        .from(recordDocuments)
                        .where(eq(recordDocuments.recordId, record.id));
                    details = documentDetails;
                    break;
            }
            
            return {
                ...record,
                details
            };
        })
    );

    return c.json({ records: recordsWithDetails });

  } catch (error) {
    console.error(`Error fetching medical records for user ${user.id}:`, error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /me/records/:recordId
 * Fetches a single medical record by its ID, ensuring it belongs to the authenticated user.
 */
meRoutes.get('/records/:recordId', async (c) => {
    const user = c.get('user');
    const { recordId } = c.req.param();

    try {
        // First, fetch the base record and join with appointments to verify ownership.
        const [baseRecord] = await db.select({
            id: medicalRecords.id,
            appointmentId: medicalRecords.appointmentId,
            recordType: medicalRecords.recordType,
            createdAt: medicalRecords.createdAt,
            appointment: {
                id: appointments.id,
                appointmentTime: appointments.appointmentTime,
            },
            doctor: {
                fullName: doctors.fullName,
            },
            clinic: {
                name: clinics.name,
            },
            service: {
                name: services.name,
            },
        })
        .from(medicalRecords)
        .innerJoin(appointments, eq(medicalRecords.appointmentId, appointments.id))
        .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
        .innerJoin(clinics, eq(appointments.clinicId, clinics.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .where(
            and(
                eq(medicalRecords.id, recordId), // The specific record
                eq(appointments.patientId, user.id) // That belongs to the auth'd user
            )
        );

        if (!baseRecord) {
            return c.json({ error: 'Record not found or you do not have permission to view it.' }, 404);
        }

        // Restructure to match the list endpoint format
        const restructuredRecord = {
            id: baseRecord.id,
            appointmentId: baseRecord.appointmentId,
            recordType: baseRecord.recordType,
            createdAt: baseRecord.createdAt,
            appointment: {
                id: baseRecord.appointment.id,
                appointmentTime: baseRecord.appointment.appointmentTime,
                doctor: baseRecord.doctor,
                clinic: baseRecord.clinic,
                service: baseRecord.service,
            }
        };

        // Now, fetch the specific details for the found record
        let details = null;
        switch (baseRecord.recordType) {
            case 'DOCTOR_NOTE':
                details = await db.query.recordDoctorNotes.findFirst({ where: eq(recordDoctorNotes.recordId, baseRecord.id) });
                break;
            case 'PRESCRIPTION':
                details = await db.query.recordPrescriptions.findFirst({ where: eq(recordPrescriptions.recordId, baseRecord.id) });
                break;
            case 'CLINICAL_DOCUMENT':
            case 'LAB_RESULT':
                details = await db.query.recordDocuments.findFirst({ where: eq(recordDocuments.recordId, baseRecord.id) });
                break;
        }

        const enrichedRecord = { ...restructuredRecord, details };
        return c.json(enrichedRecord);

    } catch (error) {
        console.error(`Error fetching single medical record ${recordId}:`, error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * GET /me/records/:recordId/download
 * Generates a signed URL for downloading medical documents.
 * Supports both CLINICAL_DOCUMENT and PRESCRIPTION types.
 * Enhanced with comprehensive audit logging.
 */
meRoutes.get('/records/:recordId/download', async (c) => {
    const user = c.get('user');
    const { recordId } = c.req.param();

    try {
        console.log(`[USER_DOWNLOAD] User ${user.id} (${user.email}) requesting download for record ${recordId}`);
        
        // First, verify the user owns this record and it supports downloads
        const [record] = await db.select({
            id: medicalRecords.id,
            recordType: medicalRecords.recordType,
            appointmentId: medicalRecords.appointmentId,
            createdAt: medicalRecords.createdAt,
        })
        .from(medicalRecords)
        .innerJoin(appointments, eq(medicalRecords.appointmentId, appointments.id))
        .where(
            and(
                eq(medicalRecords.id, recordId),
                eq(appointments.patientId, user.id),
                or(
                    eq(medicalRecords.recordType, 'CLINICAL_DOCUMENT'),
                    eq(medicalRecords.recordType, 'PRESCRIPTION')
                )
            )
        );

        if (!record) {
            console.warn(`[USER_DOWNLOAD] Record ${recordId} not found or access denied for user ${user.id}`);
            return c.json({ error: 'Document not found or you do not have permission to access it.' }, 404);
        }

        // Log successful record access
        console.log(`[USER_DOWNLOAD] User ${user.id} accessing record ${recordId} (type: ${record.recordType}, appointment: ${record.appointmentId})`);        

        // Get file details based on record type
        let documentDetails: any = null;
        let filePath: string | null = null;
        let fileName: string | null = null;
        let fileType: string | null = null;

        switch (record.recordType) {
            case 'CLINICAL_DOCUMENT':
                const [docDetails] = await db.select()
                    .from(recordDocuments)
                    .where(eq(recordDocuments.recordId, record.id));
                
                if (!docDetails || !docDetails.filePath) {
                    console.warn(`[USER_DOWNLOAD] No file found for CLINICAL_DOCUMENT record ${recordId}`);
                    return c.json({ error: 'Document file not found.' }, 404);
                }
                
                documentDetails = docDetails;
                filePath = docDetails.filePath;
                fileName = docDetails.documentName;
                fileType = docDetails.fileType;
                break;

            case 'PRESCRIPTION':
                const [prescDetails] = await db.select()
                    .from(recordPrescriptions)
                    .where(eq(recordPrescriptions.recordId, record.id));
                
                if (!prescDetails || !prescDetails.filePath) {
                    console.warn(`[USER_DOWNLOAD] No file found for PRESCRIPTION record ${recordId}`);
                    return c.json({ error: 'Prescription document not found.' }, 404);
                }
                
                documentDetails = prescDetails;
                filePath = prescDetails.filePath;
                fileName = prescDetails.documentName || `Prescription-${record.id}`;
                fileType = prescDetails.fileType;
                break;

            default:
                console.warn(`[USER_DOWNLOAD] Unsupported record type: ${record.recordType}`);
                return c.json({ error: `Downloads not supported for record type: ${record.recordType}` }, 400);
        }

        if (!filePath) {
            console.warn(`[USER_DOWNLOAD] No file path found for record ${recordId}`);
            return c.json({ error: 'Document file not found.' }, 404);
        }

        // Log file details for audit
        console.log(`[USER_DOWNLOAD] File details: name='${fileName}', path='${filePath}', type='${fileType}'`);

        // Create Supabase admin client
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Generate signed URL (valid for 1 hour)
        const { data, error } = await supabaseAdmin.storage
            .from('medical-documents')
            .createSignedUrl(filePath, 3600); // 1 hour

        if (error) {
            console.error(`[USER_DOWNLOAD] Supabase error generating signed URL for record ${recordId}:`, error);
            return c.json({ error: 'Failed to generate download link.' }, 500);
        }

        // Log successful download generation
        console.log(`[USER_DOWNLOAD] SUCCESS - User ${user.id} generated download for record ${recordId} (${fileName})`);
        
        // Log to audit trail for compliance
        const { logUserDownload, getClientIP, getUserAgent } = await import('../lib/audit-logger');
        await logUserDownload({
            userId: user.id,
            userEmail: user.email || 'unknown@user.com',
            recordId: recordId,
            recordType: record.recordType,
            fileName: fileName || 'unknown',
            fileType: fileType || undefined,
            ipAddress: getClientIP(c.req.raw),
            userAgent: getUserAgent(c.req.raw),
        });

        return c.json({
            downloadUrl: data.signedUrl,
            fileName: fileName || 'medical-document',
            fileType: fileType || 'application/octet-stream',
            recordType: record.recordType,
            expiresIn: 3600, // 1 hour in seconds
            metadata: {
                recordId: record.id,
                appointmentId: record.appointmentId,
                downloadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error(`[USER_DOWNLOAD] CRITICAL ERROR for record ${recordId} by user ${user.id}:`, error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

const updateProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleInitial: z.string().max(5).optional(),
    birthday: z.string().optional(),
    contactNo: z.string().optional(),
    street: z.string().optional(),
    provinceCode: z.string().optional(),
    cityMunicipalityCode: z.string().optional(),
    barangayCode: z.string().optional(),
    civilStatus: z.string().optional(),
    religion: z.string().optional(),
    occupation: z.string().optional(),
    philhealthNo: z.string().optional(),
    genderIdentity: z.string().optional(),
    pronouns: z.string().optional(),
    assignedSexAtBirth: z.string().optional(),
});

/**
 * PUT /me/profile
 * Updates the profile for the authenticated user.
 */
meRoutes.put('/profile', zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user');
  const validatedData = c.req.valid('json');

  try {
    // Drizzle's .set() method expects camelCase keys and maps them to snake_case columns automatically.
    // The linter confirms this behavior.
    const [updatedProfile] = await db.update(profiles)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(profiles.id, user.id))
      .returning();
    
    if (!updatedProfile) {
      return c.json({ error: 'Profile not found for update' }, 404);
    }
    
    return c.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to update profile' }, 500);
  }
});

// ============================================================================
// HEALTH BUDDY ROUTES
// ============================================================================

// "Golden Standard" Zod Schema for Health Logs
const moodEnum = z.enum(['happy', 'neutral', 'sad', 'anxious', 'stressed']);

const createHealthLogSchema = z.object({
  logDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date string" }),
  mood: moodEnum,
  symptoms: z.array(z.string()), // An array of symptom strings
  notes: z.string().nullable(), // Allow null for notes
});

// "Golden Standard" Zod Schema for Menstrual Logs
export const menstrualLogSchema = z.object({
  // Dates should be received as strings in YYYY-MM-DD format
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format. Use YYYY-MM-DD."),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format. Use YYYY-MM-DD."),
});

/**
 * POST /me/health-logs
 * Creates a new daily health log for the authenticated user.
 */
meRoutes.post(
  '/health-logs',
  zValidator('json', createHealthLogSchema),
  async (c) => {
    const user = c.get('user');
    const logData = c.req.valid('json');
    try {
      console.log(`Attempting to insert health log for user ${user.id}`, logData);
      
      // Convert the incoming ISO date string to YYYY-MM-DD format for the 'date' column type
      const formattedLogDate = new Date(logData.logDate).toISOString().split('T')[0];

      const [newLog] = await db
        .insert(healthLogs)
        .values({
          patientId: user.id,
          logDate: formattedLogDate,
          mood: logData.mood,
          symptoms: logData.symptoms,
          notes: logData.notes,
        })
        .returning();
      return c.json(newLog, 201);
    } catch (error: any) {
      console.error("CRASH in /health-logs:", error);
      return c.json({ error: 'Failed to save health log', message: error.message }, 500);
    }
  }
);

/**
 * GET /me/health-logs
 * Fetches recent health logs for the authenticated user.
 */
meRoutes.get('/health-logs', async (c) => {
    const user = c.get('user');
    try {
        const logs = await db.query.healthLogs.findMany({
            where: eq(healthLogs.patientId, user.id),
            orderBy: (healthLogs, { desc }) => [desc(healthLogs.logDate)],
            limit: 30, // Get the last 30 logs
        });
        return c.json({ health_logs: logs });
    } catch (error) {
        console.error(`Error fetching health logs for user ${user.id}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /me/ai/insight
 * Generates a health insight for the user based on their recent logs.
 */
meRoutes.get('/ai/insight', async (c) => {
  const user = c.get('user');

  try {
    // Step 1: Fetch the user's recent health data (last 7 days for more relevant insights)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const formattedDate = sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

    const recentHealthLogs = await db.query.healthLogs.findMany({
      where: and(
        eq(healthLogs.patientId, user.id),
        gte(healthLogs.logDate, formattedDate)
      ),
      orderBy: (logs, { desc }) => [desc(logs.logDate)],
    });

    if (recentHealthLogs.length === 0) {
        return c.json({ insight: "We don't have enough data to generate an insight yet. Try logging your symptoms for a day or two!" });
    }

    // Determine if we should generate a daily or weekly insight
    const uniqueLogDays = new Set(recentHealthLogs.map(log => log.logDate.split('T')[0]));

    let prompt = '';

    // Common instructions for the AI
    const basePromptInstructions = `
        You are CarePoP's AI Health Buddy, a wellness assistant with a unique personality: you are nuanced, a bit quirky, and deeply supportive. Think of yourself as a wise, slightly eccentric friend who sees things from a different angle.
        
        Your core mission is to analyze the user's health log and provide a short (2-3 sentences), actionable insight.
        
        Here are your rules:
        1.  **Nuanced & Quirky Tone:** Use interesting analogies or a clever turn of phrase. Acknowledge that wellness isn't always straightforward. Be playful but always empathetic.
        2.  **Inclusivity is Key:** The user is part of the LGBTQ+ community. ALWAYS use inclusive and gender-neutral language (e.g., "your body," "your energy," "this experience" instead of gendered terms).
        3.  **Safety First (No Medical Advice):** STRICTLY DO NOT PROVIDE MEDICAL ADVICE. Your focus is on wellness, self-care, noticing patterns, and offering gentle, creative suggestions.
        4.  **Be Data-Driven:** If a data point is empty, don't mention it.
        5.  **Speak Directly:** Frame the output as a helpful, encouraging message directly to the user.
    `;

    if (uniqueLogDays.size === 1) {
      // --- DAILY INSIGHT ---
      const todayLog = recentHealthLogs[0];
      prompt = `
        ${basePromptInstructions}
        The user has logged their feelings for today. Based on this single day's entry, provide a wellness suggestion for them to consider today.

        Today's Data:
        - Symptoms logged: ${todayLog.symptoms?.join(', ') || 'None'}
        - Mood logged: ${todayLog.mood || 'None'}
        - Notes: ${todayLog.notes || 'None'}

        Generate a one-paragraph wellness suggestion for today.
      `;
    } else {
      // --- PATTERN INSIGHT ---
      const symptomsSummary = [...new Set(recentHealthLogs.flatMap(log => log.symptoms || []))];
      const moodSummary = [...new Set(recentHealthLogs.map(log => log.mood).filter(Boolean))];
      
      prompt = `
        ${basePromptInstructions}
        The user has logged their health for multiple days this past week. Look for potential patterns or connections in their data and provide an insight.

        Data from the last ${uniqueLogDays.size} days:
        - Common symptoms logged: ${symptomsSummary.join(', ') || 'None'}
        - Moods experienced: ${moodSummary.join(', ') || 'None'}

        Generate a one-paragraph insight about potential patterns.
      `;
    }

    // Step 4: Generate content
    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const insightText = response.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate an insight at this time. Please try again later.";
    
    return c.json({ insight: insightText });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    return c.json({ error: 'Failed to generate insight from Vertex AI' }, 500);
  }
});

/**
 * POST /me/menstrual-logs
 * Creates a new menstrual cycle log for the authenticated user.
 */
meRoutes.post('/menstrual-logs', zValidator('json', menstrualLogSchema), async (c) => {
  const user = c.get('user');
  const { start_date, end_date } = c.req.valid('json');
  const userId = user?.id;

  if (!userId) {
      return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const [newLog] = await db.insert(menstrualLogs).values({
        patientId: userId,
        startDate: start_date,
        endDate: end_date,
    }).returning();
    
    return c.json({ data: newLog }, 201);

  } catch (error: any) {
      console.error('Error in menstrual log creation:', error);
      return c.json({ error: 'Failed to save menstrual log', message: error.message }, 500);
  }
});

/**
 * POST /me/appointments
 * Creates a new appointment for the authenticated user after server-side validation.
 */
meRoutes.post('/appointments', zValidator('json', createAppointmentSchema), async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const requestedSlot = new Date(body.appointment_time);

    try {
        const newAppointment = await db.transaction(async (tx) => {
            // 1. Check for availability atomically inside the transaction.
            const availableSlots = await calculateAvailableSlots(
                tx,
                body.doctor_id,
                body.service_id,
                body.clinic_id,
                requestedSlot,
                requestedSlot
            );
            
            // Convert available slots (which are Date objects) to their millisecond representation for reliable comparison
            const availableTimeStamps = new Set(availableSlots.map(slot => slot.getTime()));

            // 2. If the requested slot is not in the set of available slots, throw an error to rollback the transaction.
            if (!availableTimeStamps.has(requestedSlot.getTime())) {
                throw new Error('This time slot is no longer available. Please select another time.');
            }

            // 3. If the slot is available, create the appointment.
            const [createdAppointment] = await tx.insert(appointments).values({
                patientId: user.id,
                clinicId: body.clinic_id,
                serviceId: body.service_id,
                doctorId: body.doctor_id,
                appointmentTime: body.appointment_time,
                status: 'scheduled',
                reasonForVisit: body.reason_for_visit,
            }).returning();
            
            return createdAppointment;
        });

        return c.json(newAppointment, 201);

    } catch (error: any) {
        console.error('Failed to create appointment:', error);
        // If it's our specific availability error, return a 409 Conflict.
        if (error.message.includes('no longer available')) {
            return c.json({ error: error.message }, 409);
        }
        // Otherwise, it's a generic server error.
        return c.json({ error: 'An unexpected error occurred while booking the appointment.' }, 500);
    }
});

/**
 * PATCH /me/appointments/:id/cancel
 * Cancels an appointment for the authenticated user, respecting the cancellation policy.
 */
meRoutes.patch('/appointments/:id/cancel', async (c) => {
    const user = c.get('user');
    const { id: appointmentId } = c.req.param();

    try {
        const [appointmentToCancel] = await db.select()
            .from(appointments)
            .where(and(
                eq(appointments.id, appointmentId), 
                eq(appointments.patientId, user.id)
            ));

        if (!appointmentToCancel) {
            return c.json({ error: 'Appointment not found or you do not have permission to cancel it.' }, 404);
        }

        if (appointmentToCancel.status !== 'scheduled') {
            return c.json({ error: 'This appointment cannot be canceled as it is not in "scheduled" status.' }, 400);
        }

        // --- Business Rule Check 2: 36-Hour Cancellation Policy ---
        const hoursUntilAppointment = differenceInHours(new Date(appointmentToCancel.appointmentTime), new Date());
        
        if (hoursUntilAppointment < 36) {
            return c.json({ error: `Appointments cannot be canceled within 36 hours of the scheduled time.` }, 400);
        }

        // Proceed with cancellation
        const [updatedAppointment] = await db.update(appointments)
            .set({ status: 'canceled_by_patient' })
            .where(eq(appointments.id, appointmentId))
            .returning();
        
        return c.json({ data: updatedAppointment });

    } catch (error) {
        console.error(`Error canceling appointment ${appointmentId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default meRoutes;
