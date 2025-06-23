import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { appointments, healthLogs, doctors, clinics, services } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { authMiddleware, AuthEnv } from '../middleware/auth';
// Mock Vertex AI import for demonstration purposes
// import { VertexAI } from '@google-cloud/aiplatform';

const meRoutes = new Hono<AuthEnv>();

// Apply auth middleware to all routes in this module
meRoutes.use('*', authMiddleware);

/**
 * GET /me/appointments
 * Fetches all appointments for the authenticated user, including related details.
 */
meRoutes.get('/appointments', async (c) => {
  const user = c.get('user');

  try {
    const userAppointments = await db.query.appointments.findMany({
      where: eq(appointments.patientId, user.id),
      with: {
        doctor: true,
        clinic: true,
        service: true,
      },
      orderBy: (appointments, { desc }) => [desc(appointments.appointmentTime)],
    });

    return c.json(userAppointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
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

export default meRoutes;
