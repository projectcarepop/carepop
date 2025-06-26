import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, profiles, doctors, services } from '../../../drizzle/schema';
import { eq, sql, count } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, AuthEnv } from '../middleware/auth';

const adminRoutes = new Hono<AuthEnv>();

// Apply middleware to all routes in this file
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

// --- Service Management Endpoints ---
adminRoutes.get('/services', async (c) => {
  try {
    const allServices = await db.query.services.findMany({
      with: {
        serviceCategory: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (services, { desc }) => [desc(services.name)],
    });

    return c.json(allServices);
  } catch (error) {
    console.error("Failed to fetch services with categories:", error);
    return c.json({ error: "Internal Server Error" }, 500);
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

/**
 * GET /api/admin/users
 * Fetches a list of all users. Protected admin route.
 */
adminRoutes.get('/users', async (c) => {
  try {
    const allUsers = await db.select().from(profiles);
    return c.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch users.' }, 500);
  }
});

/**
 * GET /api/admin/stats
 * Fetches dashboard stats. Protected admin route.
 */
adminRoutes.get('/stats', async (c) => {
  try {
    const [userStats] = await db.select({ value: count() }).from(profiles);
    const [clinicStats] = await db.select({ value: count() }).from(clinics);

    const stats = {
      totalUsers: userStats.value,
      totalClinics: clinicStats.value,
      appointmentsToday: 0, // Placeholder
      pendingApprovals: 0,  // Placeholder
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch stats.' }, 500);
  }
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

// Add other admin routes here in the future...

export default adminRoutes;
