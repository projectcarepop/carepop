import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, profiles, doctors, services, productCategories, products, inventory, serviceCategories, appointments } from '../../../drizzle/schema';
import { eq, sql, count, asc } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, AuthEnv } from '../middleware/auth';

const adminRoutes = new Hono<AuthEnv>();

// --- DIAGNOSTIC MIDDLEWARE ---
adminRoutes.use('*', async (c, next) => {
  console.log(`[ADMIN] Received request for: ${c.req.path}`);
  // We will try to get the user from the authMiddleware's context
  // This will help us see if the auth check is passing before the route handler runs.
  try {
    const user = c.get('user');
    // @ts-ignore
    console.log(`[ADMIN] Middleware check: User found with role '${user?.app_metadata?.role}'.`);
  } catch (e) {
    console.log("[ADMIN] Middleware check: 'user' not found in context yet.");
  }
  await next(); // Pass control to the next middleware (auth, admin, then the handler)
});
// --- END DIAGNOSTIC MIDDLEWARE ---

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

// Schema for creating/updating product categories
const productCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
});

// Schema for creating/updating products
const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.string(), // Prices are often handled as strings to avoid floating point issues
    categoryId: z.string().uuid('A valid category ID is required'),
    isActive: z.boolean().optional().default(true),
});

// Schema for updating stock
const updateStockSchema = z.object({
    quantityOnHand: z.number().int('Quantity must be a whole number.'),
});

// Schema for creating/updating services
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.string(),
  durationMinutes: z.number().int().positive("Duration must be a positive number"),
  categoryId: z.string().uuid("A valid category ID is required"),
  isActive: z.boolean().optional().default(true),
});

// Schema for creating/updating service categories
const serviceCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
});

// --- Clinic Management Endpoints ---

adminRoutes
  .get('/clinics', async (c) => {
    const allClinics = await db.select().from(clinics);
    return c.json({ data: allClinics });
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
    return c.json({ success: true });
  });

// --- Inventory Management Endpoints ---

// -- Product Categories --
adminRoutes
  .get('/product-categories', async (c) => {
    const categories = await db.query.productCategories.findMany({
      orderBy: (productCategories, { asc }) => [asc(productCategories.name)],
    });
    return c.json({ data: categories });
  })
  .post('/product-categories', zValidator('json', productCategorySchema), async (c) => {
    const newCategoryData = c.req.valid('json');
    const [createdCategory] = await db.insert(productCategories).values(newCategoryData).returning();
    return c.json(createdCategory, 201);
  });

adminRoutes
  .get('/product-categories/:id', async (c) => {
    const { id } = c.req.param();
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    if (!category) return c.json({ error: 'Not Found' }, 404);
    return c.json(category);
  })
  .put('/product-categories/:id', zValidator('json', productCategorySchema.partial()), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');
    const [updatedCategory] = await db.update(productCategories).set(values).where(eq(productCategories.id, id)).returning();
    if (!updatedCategory) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedCategory);
  })
  .delete('/product-categories/:id', async (c) => {
    const { id } = c.req.param();
    // TODO: Add logic to handle products associated with this category before deleting.
    const [deleted] = await db.delete(productCategories).where(eq(productCategories.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// -- Products --
adminRoutes
  .get('/products', async (c) => {
    const allProducts = await db.query.products.findMany({
      with: {
        productCategory: {
          columns: { name: true }
        },
        inventory: {
            columns: { quantityOnHand: true }
        }
      },
      orderBy: (products, { asc }) => [asc(products.name)],
    });

    const responseData = allProducts.map((p: any) => ({
        ...p,
        categoryName: p.productCategory?.name || 'N/A',
        quantityOnHand: p.inventory?.quantityOnHand ?? 0,
        inventory: undefined, 
        productCategory: undefined,
    }));

    return c.json({ data: responseData });
  })
  .post('/products', zValidator('json', productSchema), async (c) => {
    const newProductData = c.req.valid('json');
    // Use a transaction to ensure both product and inventory are created
    const newProduct = await db.transaction(async (tx) => {
        const [createdProduct] = await tx.insert(products).values(newProductData).returning();
        await tx.insert(inventory).values({ productId: createdProduct.id, quantityOnHand: 0 });
        return createdProduct;
    });
    return c.json(newProduct, 201);
  });

adminRoutes
  .get('/products/:id', async (c) => {
    const { id } = c.req.param();
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return c.json({ error: 'Not Found' }, 404);
    return c.json(product);
  })
  .put('/products/:id', zValidator('json', productSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');
    const [updatedProduct] = await db.update(products).set(values).where(eq(products.id, id)).returning();
    if (!updatedProduct) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedProduct);
  })
  .delete('/products/:id', async (c) => {
    const { id } = c.req.param();
    // Drizzle will handle cascading deletes if set up in the DB.
    // Explicitly deleting from inventory first is safer if not.
    await db.delete(inventory).where(eq(inventory.productId, id));
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// -- Stock Management --
adminRoutes
  .put('/inventory/:productId', zValidator('json', updateStockSchema), async (c) => {
      const { productId } = c.req.param();
      const { quantityOnHand } = c.req.valid('json');

      const [updatedStock] = await db.update(inventory)
        .set({ quantityOnHand, updatedAt: new Date().toISOString() })
        .where(eq(inventory.productId, productId))
        .returning();

      if (!updatedStock) return c.json({ error: 'Inventory record not found for this product' }, 404);

      return c.json({ success: true, updatedStock });
  });

// --- Doctor Management Endpoints ---

adminRoutes.get('/doctors', async (c) => {
    // TODO: This query needs to be fleshed out with joins for services, clinics etc.
    // For now, fetching the basic doctor profiles.
    const allDoctors = await db.select().from(doctors);
    return c.json({ data: allDoctors });
});

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

adminRoutes
  .get('/doctors/:id', async (c) => {
    const { id } = c.req.param();
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    if (!doctor) return c.json({ error: 'Not Found' }, 404);
    return c.json(doctor);
  })
  .put('/doctors/:id', zValidator('json', createDoctorSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');
    const [updatedDoctor] = await db.update(doctors).set(values).where(eq(doctors.id, id)).returning();
    if (!updatedDoctor) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedDoctor);
  })
  .delete('/doctors/:id', async (c) => {
    const { id } = c.req.param();
    const [deleted] = await db.delete(doctors).where(eq(doctors.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// --- Service Management Endpoints ---
adminRoutes.get('/services', async (c) => {
  console.log("[GET /services] Handler started.");
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
    console.log(`[GET /services] Successfully fetched ${allServices.length} services.`);
    return c.json({ data: allServices });
  } catch (error) {
    console.error("[GET /services] CRASH:", error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

adminRoutes.post('/services', zValidator('json', serviceSchema), async (c) => {
    const newServiceData = c.req.valid('json');
    const [createdService] = await db.insert(services).values(newServiceData).returning();
    return c.json(createdService, 201);
});

adminRoutes.put('/services/:id', zValidator('json', serviceSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');
    const [updatedService] = await db.update(services).set(values).where(eq(services.id, id)).returning();
    if (!updatedService) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedService);
});

adminRoutes.delete('/services/:id', async (c) => {
    const { id } = c.req.param();
    const [deleted] = await db.delete(services).where(eq(services.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
});

// -- Service Categories --
adminRoutes
  .get('/service-categories', async (c) => {
    const categories = await db.query.serviceCategories.findMany({
      orderBy: (serviceCategories, { asc }) => [asc(serviceCategories.name)],
    });
    return c.json({ data: categories });
  })
  .post('/service-categories', zValidator('json', serviceCategorySchema), async (c) => {
    const newCategoryData = c.req.valid('json');
    const [createdCategory] = await db.insert(serviceCategories).values(newCategoryData).returning();
    return c.json(createdCategory, 201);
  });

adminRoutes
  .put('/service-categories/:id', zValidator('json', serviceCategorySchema.partial()), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');
    const [updatedCategory] = await db.update(serviceCategories).set(values).where(eq(serviceCategories.id, id)).returning();
    if (!updatedCategory) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedCategory);
  })
  .delete('/service-categories/:id', async (c) => {
    const { id } = c.req.param();
    // TODO: Add logic for services associated with this category
    const [deleted] = await db.delete(serviceCategories).where(eq(serviceCategories.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// --- Appointment Management Endpoints ---
adminRoutes.get('/appointments', async (c) => {
    try {
        const allAppointments = await db.query.appointments.findMany({
            with: {
                patient: {
                    columns: {
                        firstName: true,
                        lastName: true,
                    }
                },
                doctor: {
                    columns: {
                        fullName: true,
                    }
                },
                service: {
                    columns: {
                        name: true,
                    }
                },
                clinic: {
                    columns: {
                        name: true,
                    }
                }
            },
            orderBy: (appointments, { desc }) => [desc(appointments.appointmentTime)],
        });

        const responseData = allAppointments.map((a: any) => ({
            ...a,
            patientName: `${a.patient.firstName || ''} ${a.patient.lastName || ''}`.trim(),
            doctorName: a.doctor.fullName,
            serviceName: a.service.name,
            clinicName: a.clinic.name,
        }));

        return c.json({ data: responseData });
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return c.json({ message: "Error fetching appointments", error: error.message }, 500);
    }
});

adminRoutes.get('/appointments/:id', async (c) => {
    const { id } = c.req.param();
    try {
        const [appointment] = await db.query.appointments.findMany({
            where: eq(appointments.id, id),
            with: {
                patient: {
                    columns: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        contactNo: true,
                    }
                },
                doctor: {
                    columns: {
                        fullName: true,
                        specialtyText: true,
                    }
                },
                service: {
                    columns: {
                        name: true,
                        price: true,
                        durationMinutes: true,
                    }
                },
                clinic: {
                    columns: {
                        name: true,
                        address: true,
                    }
                }
            }
        });

        if (!appointment) return c.json({ error: 'Not Found' }, 404);
        
        return c.json(appointment);

    } catch (error: any) {
        console.error(`Error fetching appointment ${id}:`, error);
        return c.json({ message: `Error fetching appointment ${id}`, error: error.message }, 500);
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
    return c.json({ data: allUsers });
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
    const [userCount] = await db.select({ count: count() }).from(profiles);
    const [doctorCount] = await db.select({ count: count() }).from(doctors);
    const [clinicCount] = await db.select({ count: count() }).from(clinics);
    const [appointmentCount] = await db.select({ count: count() }).from(appointments);

    return c.json({
      data: {
        users: userCount.count,
        doctors: doctorCount.count,
        clinics: clinicCount.count,
        appointments: appointmentCount.count,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
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

adminRoutes.delete('/users/:id', async (c) => {
    const { id } = c.req.param();
    // This will cascade and delete the user from auth.users as well.
    const [deletedUser] = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    if (!deletedUser) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
});

// Add other admin routes here in the future...

export default adminRoutes;
