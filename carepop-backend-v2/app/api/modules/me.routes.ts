import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sql, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { appointments, doctors, clinics, services, medicalRecords, recordDoctorNotes, recordPrescriptions, recordDocuments, profiles } from '../../../drizzle/schema';
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
      role: 'patient', // Set default role on initial creation
      ...validatedProfileData,
    }).onConflictDoUpdate({
      target: profiles.id,
      set: {
        ...validatedProfileData,
        updatedAt: new Date().toISOString()
        // The role should not be updated here, it's set once on creation
        // or managed by an admin.
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
