import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sql, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, doctors, clinics, services, medicalRecords, recordDoctorNotes, recordPrescriptions, recordDocuments, profiles, healthLogs, menstrualLogs } from '../../../drizzle/schema';
import { and, eq, gte } from 'drizzle-orm';
import { authMiddleware, AuthEnv } from '../middleware/auth';
import { generativeModel } from '../../../src/services/vertex-ai';
import type { InferInsertModel } from 'drizzle-orm';

const meRoutes = new Hono<AuthEnv>();

// Apply auth middleware to all routes in this module
meRoutes.use('*', authMiddleware);

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
  const { appointments: schemaAppointments } = await import('../../../drizzle/schema');

  try {
    const userAppointmentsWithRecords = await db.query.appointments.findMany({
        where: eq(schemaAppointments.patientId, user.id),
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
    const records = userAppointmentsWithRecords.flatMap(appt => 
        appt.medicalRecords.map(record => ({
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

    return c.json({ records });

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
            recordId: medicalRecords.id,
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

        // Now, fetch the specific details for the found record
        let details = null;
        switch (baseRecord.recordType) {
            case 'DOCTOR_NOTE':
                details = await db.query.recordDoctorNotes.findFirst({ where: eq(recordDoctorNotes.recordId, baseRecord.recordId) });
                break;
            case 'PRESCRIPTION':
                details = await db.query.recordPrescriptions.findFirst({ where: eq(recordPrescriptions.recordId, baseRecord.recordId) });
                break;
            case 'CLINICAL_DOCUMENT':
                details = await db.query.recordDocuments.findFirst({ where: eq(recordDocuments.recordId, baseRecord.recordId) });
                break;
        }

        const enrichedRecord = { ...baseRecord, details };
        return c.json(enrichedRecord);

    } catch (error) {
        console.error(`Error fetching single medical record ${recordId}:`, error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// Zod schema for creating a new appointment
const createAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  serviceId: z.string().uuid(),
  clinicId: z.string().uuid(),
  appointmentTime: z.string().datetime(),
});

/**
 * POST /me/appointments
 * Creates a new appointment for the authenticated user.
 */
meRoutes.post('/appointments', zValidator('json', createAppointmentSchema), async (c) => {
  const user = c.get('user');
  const newAppointmentData = c.req.valid('json');

  try {
    const [createdAppointment] = await db.insert(appointments).values({
      patientId: user.id,
      ...newAppointmentData
    }).returning();
    
    return c.json(createdAppointment, 201);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to create appointment' }, 500);
  }
});

/**
 * PATCH /me/appointments/:id/cancel
 * Cancels a specific appointment for the authenticated user.
 */
meRoutes.patch('/appointments/:id/cancel', async (c) => {
  const user = c.get('user');
  const appointmentId = c.req.param('id');

  try {
    // First, verify the appointment exists and belongs to the user
    const [appointment] = await db.select().from(appointments).where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.patientId, user.id)
      )
    );

    if (!appointment) {
      return c.json({ error: 'Appointment not found or you do not have permission to cancel it.' }, 404);
    }
    
    if (appointment.status !== 'scheduled') {
        return c.json({ error: 'Only scheduled appointments can be canceled.' }, 400);
    }

    // Update the appointment status
    const [updatedAppointment] = await db.update(appointments)
      .set({ status: 'canceled_by_patient' })
      .where(eq(appointments.id, appointmentId))
      .returning();

    return c.json({ message: 'Appointment canceled successfully.' });
  } catch (error) {
    console.error(`Error canceling appointment ${appointmentId}:`, error);
    return c.json({ error: 'Internal Server Error' }, 500);
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

export default meRoutes;
