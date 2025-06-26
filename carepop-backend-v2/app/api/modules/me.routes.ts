import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, healthLogs, doctors, clinics, services, medicalRecords, profiles } from '../../../drizzle/schema';
import { and, eq, exists } from 'drizzle-orm';
import { authMiddleware, AuthEnv } from '../middleware/auth';
// Mock Vertex AI import for demonstration purposes
// import { VertexAI } from '@google-cloud/aiplatform';

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
 * GET /me/medical-records
 * Fetches all medical records for the authenticated user, grouped by appointment.
 */
meRoutes.get('/medical-records', async (c) => {
  const user = c.get('user');
  try {
    console.log(`Fetching basic medical records for user: ${user.id}`);
    // This is a more complex query, as we need to find records via appointments
    const userMedicalRecords = await db
      .select()
      .from(medicalRecords)
      .innerJoin(appointments, eq(medicalRecords.appointmentId, appointments.id))
      .where(eq(appointments.patientId, user.id));

    console.log(`Successfully fetched ${userMedicalRecords.length} basic records.`);
    return c.json({ records: userMedicalRecords.map(r => r.medical_records) }); // Return just the record part

  } catch (error) {
    console.error("Error during SIMPLIFIED medical records fetch:", error);
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
 * POST /me/ai/insight
 * Generates a health insight based on the user's health logs using an AI model.
 * NOTE: This is a simplified demonstration.
 */
meRoutes.post('/ai/insight', async (c) => {
  const user = c.get('user');

  try {
    // 1. Fetch user's health logs from the database
    const logs = await db.query.healthLogs.findMany({
      where: eq(healthLogs.patientId, user.id),
      orderBy: (healthLogs, { asc }) => [asc(healthLogs.logDate)],
      limit: 30, // Get the last 30 logs for context
    });

    if (logs.length === 0) {
      return c.json({ insight: "We don't have enough data to provide an insight. Start logging your health daily!" });
    }

    // 2. Construct a prompt for the AI model
    const prompt = `Based on the following recent health logs, provide a brief, supportive, and non-medical insight for the user. Logs: ${JSON.stringify(logs)}`;
    
    // 3. Call the Vertex AI SDK (or any other AI service)
    // const ai = new VertexAI({project: 'your-gcp-project', location: 'us-central1'});
    // const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    // const result = await model.generateContent(prompt);
    // const insight = result.response.candidates[0].content.parts[0].text;
    
    // MOCK RESPONSE FOR DEMONSTRATION
    const insight = "Based on your recent logs, you've been consistently tracking your symptoms. Keep up the great work! Noticing patterns is the first step to understanding your health better.";

    // 4. Return the response
    return c.json({ insight });

  } catch (error) {
    console.error('Error generating AI insight:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
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

    return c.json(updatedAppointment);
  } catch (error) {
    console.error(`Error canceling appointment ${appointmentId}:`, error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to cancel appointment.' }, 500);
  }
});

// Zod schema for updating a user's profile
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  middleInitial: z.string().max(1).optional().nullable(),
  contactNo: z.string().optional().nullable(),
  birthday: z.string().optional().nullable(),
  genderIdentity: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  assignedSexAtBirth: z.string().optional().nullable(),
  civilStatus: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  philhealthNo: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  barangayCode: z.string().optional().nullable(),
  cityMunicipalityCode: z.string().optional().nullable(),
  provinceCode: z.string().optional().nullable(),
  avatarUrl: z.string().url("Invalid URL format").optional().nullable(),
});

/**
 * PUT /me/profile
 * Updates the profile for the authenticated user.
 */
meRoutes.put('/profile', zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user');
  const validatedProfileData = c.req.valid('json');

  if (!user.email) {
    return c.json({ error: 'User email not found in authentication token.' }, 400);
  }

  try {
    const [result] = await db.insert(profiles).values({
      id: user.id,
      email: user.email,
      ...validatedProfileData,
    }).onConflictDoUpdate({
      target: profiles.id,
      set: {
        ...validatedProfileData,
        updatedAt: new Date().toISOString()
      }
    }).returning();
    
    return c.json(result);
    
  } catch (error: any) {
    // Check for a specific database error code for unique constraint violation
    if (error.code === '23505') { 
      return c.json({ message: 'A profile with this email already exists.' }, 409); // 409 Conflict
    }
    console.error('Error upserting profile:', error);
    return c.json({ message: 'An internal server error occurred.' }, 500);
  }
});

export default meRoutes;
