import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sql, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, doctors, clinics, services, medicalRecords, recordDoctorNotes, recordPrescriptions, recordDocuments, profiles, healthLogs, menstrualLogs } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { authMiddleware, AuthEnv } from '../middleware/auth';
import { VertexAI } from '@google-cloud/vertexai';

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
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ============================================================================
// HEALTH BUDDY ROUTES
// ============================================================================

const healthLogSchema = z.object({
    logDate: z.string().date(), // Expects "YYYY-MM-DD"
    mood: z.string().max(50).nullable(),
    symptoms: z.array(z.string().max(100)).nullable(),
    notes: z.string().max(1000).nullable(),
});

/**
 * POST /me/health-logs
 * Creates a new health log entry for the authenticated user.
 */
meRoutes.post('/health-logs', zValidator('json', healthLogSchema), async (c) => {
    const user = c.get('user');
    const logData = c.req.valid('json');

    try {
        const [newLog] = await db.insert(healthLogs).values({
            userId: user.id,
            ...logData,
        }).returning();

        return c.json(newLog, 201);
    } catch (error) {
        console.error(`Error creating health log for user ${user.id}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /me/health-logs
 * Fetches recent health logs for the authenticated user.
 */
meRoutes.get('/health-logs', async (c) => {
    const user = c.get('user');
    try {
        const logs = await db.query.healthLogs.findMany({
            where: eq(healthLogs.userId, user.id),
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
 * POST /me/ai/insight
 * Generates and returns an AI-powered insight based on the user's recent health logs.
 */
meRoutes.post('/ai/insight', async (c) => {
    const user = c.get('user');

    try {
        // Step 1: Fetch recent health logs and all menstrual logs
        const recentHealthLogs = await db.query.healthLogs.findMany({
            where: eq(healthLogs.userId, user.id),
            orderBy: (healthLogs, { desc }) => [desc(healthLogs.logDate)],
            limit: 30, // Analyze the last month of data
        });
        
        const cycleHistory = await db.query.menstrualLogs.findMany({
            where: eq(menstrualLogs.userId, user.id),
            orderBy: (menstrualLogs, { desc }) => [desc(menstrualLogs.startDate)],
            limit: 6, // Get the last 6 cycles for averaging
        });

        if (recentHealthLogs.length < 3 && cycleHistory.length < 2) {
            return c.json({ insight: "We need a bit more data to generate a useful insight. Keep tracking your symptoms and cycles daily!" });
        }

        // Step 2: Initialize Vertex AI
        const vertexAi = new VertexAI({
            project: process.env.GOOGLE_CLOUD_PROJECT!,
            location: process.env.GOOGLE_CLOUD_LOCATION!,
        });
        
        const generativeModel = vertexAi.getGenerativeModel({
            model: 'gemini-1.0-pro',
        });

        // Step 3: Construct the logsString variable
        const cycleString = cycleHistory.length > 0 
            ? `Menstrual Cycle History (Period Start Dates):\n${cycleHistory.map(log => `- ${log.startDate}`).join('\n')}`
            : 'Menstrual Cycle History (Period Start Dates):\n- No period data logged yet.';

        const healthLogString = recentHealthLogs.length > 0
            ? `Recent Health Logs:\n${recentHealthLogs.map(log => 
                `- Date: ${log.logDate}, Mood: ${log.mood || 'not specified'}, Symptoms: ${log.symptoms?.join(', ') || 'none'}`
              ).join('\n')}`
            : 'Recent Health Logs:\n- No health logs recorded in this period.';

        const logsString = `${cycleString}\n\n${healthLogString}`;

        // Step 4: Construct the new, comprehensive prompt
        const prompt = [
          // --- 1. PERSONA & ROLE DEFINITION ---
          'You are an AI Health Informatics Assistant for an application called Carepop. Your tone is professional, data-driven, yet empathetic and supportive.',
          'Your role is to analyze a user\'s health and menstrual cycle logs to identify patterns, estimate fertile windows, and provide general wellness suggestions based on established health science.',
          '',

          // --- 2. CORE DIRECTIVES & SAFETY GUARDRAILS (CRITICAL) ---
          '**DO NOT PROVIDE A MEDICAL DIAGNOSIS OR MEDICAL ADVICE.** You must never diagnose a condition or prescribe a specific treatment.',
          '**ALWAYS CITE THE BASIS FOR YOUR INSIGHTS.** Frame your observations by referencing general knowledge or studies (e.g., "Many people experience...", "Hormonal fluctuations during this phase can sometimes lead to...", "Studies suggest a link between hydration and...").',
          '**ALWAYS INCLUDE A STRONG DISCLAIMER.** Every response must end with a clear call to action to consult a healthcare professional for any medical concerns.',
          '',

          // --- 3. INPUT DATA ---
          'Here is the user\'s data. It includes general health logs and their menstrual cycle history:',
          '--- START OF DATA ---',
          logsString, // This variable will contain the formatted logs and cycle data
          '--- END OF DATA ---',
          '',

          // --- 4. ANALYTICAL TASK BREAKDOWN ---
          'Please perform the following analysis and structure your response using the specified format.',
          '',
          '**Step 1: Analyze the Menstrual Cycle and Estimate the Fertile Window.**',
          '   - Calculate the average cycle length from the provided start dates.',
          '   - Estimate the start of the next period.',
          '   - Ovulation typically occurs about 14 days BEFORE the next period starts.',
          '   - The fertile window is the 5 days leading up to ovulation, plus the day of ovulation itself (a 6-day window).',
          '   - If there is not enough data to calculate, state that clearly.',
          '',
          '**Step 2: Identify Key Correlations.**',
          '   - Analyze the health logs to find patterns. Look for connections between: `symptoms` (e.g., headaches, fatigue, cramps), `mood` (e.g., stress, irritability), and the user\'s current menstrual cycle phase (e.g., Follicular, Luteal, Menstrual).',
          '   - For example: "Headaches were frequently logged during the week leading up to the start of a period."',
          '',
          '**Step 3: Formulate Insights and Wellness Suggestions.**',
          '   - Based on the correlations, provide 1-2 insightful observations.',
          '   - Provide 1-2 general, non-prescriptive wellness suggestions related to the observations.',
          '   - Examples of good suggestions: "Ensuring adequate hydration may be helpful for headaches," or "Gentle exercise like walking has been shown to improve mood."',
          '',

          // --- 5. REQUIRED OUTPUT FORMAT ---
          '**Generate your response using the following Markdown format. Do not add any extra conversational text before or after.**',
          '---',
          '### Health & Cycle Insights',
          '',
          '**Estimated Fertile Window:**',
          'Based on your cycle data, your next estimated fertile window is from **[Start Date]** to **[End Date]**. Please note this is an estimate and not a foolproof method of contraception or conception.',
          // (If not enough data, use: "We need a bit more cycle data to provide an accurate estimate of your fertile window.")
          '',
          '**Key Observations:**',
          '- [Your first observation about correlations, e.g., "Analysis of your logs shows that feelings of `fatigue` were often reported in the 5-7 days before your period began. This is common as hormonal changes occur during the late luteal phase."]',
          '- [Your second observation, if any.]',
          '',
          '**Wellness Suggestions:**',
          '- [Your first wellness suggestion, e.g., "For managing pre-menstrual fatigue, some studies suggest that focusing on consistent sleep and consuming iron-rich foods can be beneficial."]',
          '- [Your second wellness suggestion, if any.]',
          '',
          '**Disclaimer:** This analysis is based on patterns in your logged data and is for informational purposes only. It is not a medical diagnosis. Please consult a healthcare professional for any medical advice or concerns.',
          '---'
        ].join('\n');
        
        // Step 5: Call the Gemini model
        const resp = await generativeModel.generateContent(prompt);
        const insightText = resp.response.candidates?.[0]?.content.parts[0]?.text || "Sorry, I couldn't generate an insight right now. Please try again later.";

        return c.json({ insight: insightText });

    } catch (error) {
        console.error(`AI Insight generation failed for user ${user.id}:`, error);
        // Do not expose detailed error info to the client
        return c.json({ error: 'Could not generate insight' }, 500);
    }
});

export default meRoutes;
