import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, profiles, doctors } from '../../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, AuthEnv } from '../middleware/auth';

const adminRoutes = new Hono<AuthEnv>();

// Apply auth and admin middleware to all routes in this module
adminRoutes.use('*', authMiddleware, adminMiddleware);

// --- Zod Schemas for Validation ---
const createClinicSchema = z.object({
  name: z.string().min(1),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
  }),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  }),
  isActive: z.boolean().optional().default(true),
});

const updateClinicSchema = createClinicSchema.partial();

const createDoctorSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  specialtyText: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['patient', 'admin']),
});

// --- Clinic Management Endpoints ---

adminRoutes
  .get('/clinics', async (c) => {
    const allClinics = await db.select().from(clinics);
    return c.json(allClinics);
  })
  .post('/clinics', zValidator('json', createClinicSchema), async (c) => {
    const { name, address, location, isActive } = c.req.valid('json');
    const point = `POINT(${location.lon} ${location.lat})`;

    const [newClinic] = await db.insert(clinics).values({
      name,
      address,
      location: sql`ST_GeomFromText(${point}, 4326)`,
      isActive,
    }).returning();
    
    return c.json(newClinic, 201);
  });

adminRoutes
  .get('/clinics/:id', async (c) => {
    const { id } = c.req.param();
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    if (!clinic) return c.json({ error: 'Not Found' }, 404);
    return c.json(clinic);
  })
  .put('/clinics/:id', zValidator('json', updateClinicSchema), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');

    // Create a mutable copy to transform
    const updatePayload: any = { ...values };

    // If location is being updated, transform it to the SQL format
    if (values.location) {
      const { lon, lat } = values.location;
      updatePayload.location = sql`ST_GeomFromText(${`POINT(${lon} ${lat})`}, 4326)`;
    }

    const [updatedClinic] = await db.update(clinics)
      .set(updatePayload)
      .where(eq(clinics.id, id))
      .returning();

    if (!updatedClinic) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedClinic);
  })
  .delete('/clinics/:id', async (c) => {
    const { id } = c.req.param();
    const [deletedClinic] = await db.delete(clinics).where(eq(clinics.id, id)).returning();
    if (!deletedClinic) return c.json({ error: 'Not Found' }, 404);
    return c.body(null, 204);
  });

// --- Doctor Management Endpoints ---
adminRoutes.post('/doctors', zValidator('json', createDoctorSchema), async (c) => {
  const newDoctorData = c.req.valid('json');
  
  try {
    const [createdDoctor] = await db.insert(doctors).values(newDoctorData).returning();
    return c.json(createdDoctor, 201);
  } catch (error) {
    console.error('Error creating doctor:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// --- Appointment Management Endpoints ---
adminRoutes.get('/appointments', async (c) => {
    try {
        const allAppointments = await db.query.appointments.findMany({
            with: {
                profile: { columns: { fullName: true } },
                doctor: { columns: { fullName: true } },
                service: { columns: { name: true } },
                clinic: { columns: { name: true } },
            },
            orderBy: (appointments, { desc }) => [desc(appointments.appointmentTime)],
        });
        return c.json(allAppointments);
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// --- User Management Endpoints ---

adminRoutes.get('/users', async (c) => {
  const allUsers = await db.query.profiles.findMany();
  return c.json(allUsers);
});

adminRoutes.put('/users/:id/role', zValidator('json', updateUserRoleSchema), async (c) => {
  const { id } = c.req.param();
  const { role } = c.req.valid('json');

  const [updatedUser] = await db.update(profiles)
    .set({ role })
    .where(eq(profiles.id, id))
    .returning();
  
  if (!updatedUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(updatedUser);
});


export default adminRoutes;
