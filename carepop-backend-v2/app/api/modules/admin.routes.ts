import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, profiles, doctors, services, productCategories, products, inventory, serviceCategories, appointments, medicalRecords, recordDoctorNotes, recordPrescriptions, recordDocuments } from '../../../drizzle/schema';
import { eq, sql, count, asc, and, gte, lt, getTableColumns, desc } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, AuthEnv } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

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

const updateClinicSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
  }).optional(),
  isActive: z.boolean().optional(),
  // Add latitude and longitude for location updates
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine(data => {
    // If one of lat/lon is provided, the other must be too.
    return (data.latitude === undefined && data.longitude === undefined) || (data.latitude !== undefined && data.longitude !== undefined);
}, {
    message: "Both latitude and longitude must be provided together for location updates.",
    path: ["latitude"], // report error on the latitude field
});

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

// --- NEW Medical Record Schemas ---

const noteSchema = z.object({
    recordType: z.literal('DOCTOR_NOTE'),
    details: z.object({
        note: z.string().min(1, "Note cannot be empty."),
    }),
});

const prescriptionSchema = z.object({
    recordType: z.literal('PRESCRIPTION'),
    details: z.object({
        medication: z.string().min(1, "Medication is required."),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        startDate: z.string().optional(), // Using string for date from client
        endDate: z.string().optional(),
        notes: z.string().optional(),
    }),
});

// A new union schema for validation. We will only handle notes and prescriptions here.
// Document uploads will have their own route.
const newMedicalRecordSchema = z.discriminatedUnion("recordType", [
    noteSchema,
    prescriptionSchema,
]);

// --- Clinic Management Endpoints ---

adminRoutes
  .get('/clinics', async (c) => {
    // Use Drizzle's `sql` to extract coordinates
    const clinicsWithCoords = await db.select({
        // Select all original columns
        ...getTableColumns(clinics),
        // And add the extracted lat/lon
        latitude: sql<number>`ST_Y(location::geometry)`,
        longitude: sql<number>`ST_X(location::geometry)`
    }).from(clinics);

    return c.json({ data: clinicsWithCoords });
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
    const id = c.req.param('id');
    const { latitude, longitude, ...clinicData } = c.req.valid('json');

    const payloadForDb: Record<string, any> = { ...clinicData };

    if (latitude !== undefined && longitude !== undefined) {
        payloadForDb.location = sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography`;
    }

    if (Object.keys(payloadForDb).length === 0) {
        return c.json({ error: 'No fields to update' }, 400);
    }

    try {
        const [updatedClinic] = await db.update(clinics)
            .set(payloadForDb)
            .where(eq(clinics.id, id))
            .returning();

        if (!updatedClinic) return c.json({ error: 'Not Found' }, 404);
        return c.json(updatedClinic);
    } catch (error: any) {
        console.error("Error updating clinic:", error);
        return c.json({ error: 'Failed to update clinic', message: error.message }, 500);
    }
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

      const [updatedStock] = await db
        .update(inventory)
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
const getAppointmentsSchema = z.object({
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    clinicId: z.string().optional(),
});

adminRoutes.get('/appointments', zValidator('query', getAppointmentsSchema), async (c) => {
    try {
        const { date_from, date_to, clinicId } = c.req.valid('query');
        const conditions = [];

        if (date_from) {
            conditions.push(gte(appointments.appointmentTime, date_from));
        }
        if (date_to) {
            const toDate = new Date(date_to);
            toDate.setDate(toDate.getDate() + 1);
            conditions.push(lt(appointments.appointmentTime, toDate.toISOString().split('T')[0]));
        }
        if (clinicId) {
            conditions.push(eq(appointments.clinicId, clinicId));
        }
        
        const allAppointments = await db.query.appointments.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                clinic: { columns: { name: true } },
                doctor: { columns: { fullName: true } },
                patient: { columns: { firstName: true, lastName: true } },
            },
            orderBy: [desc(appointments.appointmentTime)],
        });

        return c.json({ data: allAppointments });
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return c.json({ error: 'Failed to fetch appointments', message: error.message }, 500);
    }
});

adminRoutes.get('/appointments/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const user = c.get('user');

        console.log(`[GET /appointments/:id] Admin user ${user?.id} fetching appointment ${id}`);

        // Step 1: Fetch the core appointment details and simple relations
        const appointment = await db.query.appointments.findFirst({
            where: eq(appointments.id, id),
            with: {
                patient: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        birthday: true,
                        genderIdentity: true,
                    }
                },
                doctor: true,
                service: true,
                clinic: true,
                // Fetch base medical records. We will enrich them below.
                medicalRecords: {
                    orderBy: (medicalRecords, { desc }) => [desc(medicalRecords.createdAt)],
                }
            }
        });

        if (!appointment) {
            console.warn(`[GET /appointments/:id] Appointment ${id} not found.`);
            return c.json({ error: 'Appointment not found' }, 404);
        }

        // Step 2 & 3: Enrich medical records with details from specialized tables
        const enrichedMedicalRecords = await Promise.all(
            appointment.medicalRecords.map(async (record) => {
                let details: any = null;
                switch (record.recordType) {
                    case 'DOCTOR_NOTE':
                        details = await db.query.recordDoctorNotes.findFirst({
                            where: eq(recordDoctorNotes.recordId, record.id)
                        });
                        break;
                    case 'PRESCRIPTION':
                        details = await db.query.recordPrescriptions.findFirst({
                            where: eq(recordPrescriptions.recordId, record.id)
                        });
                        break;
                    case 'LAB_RESULT':
                    case 'CLINICAL_DOCUMENT':
                        details = await db.query.recordDocuments.findFirst({
                            where: eq(recordDocuments.recordId, record.id)
                        });
                        break;
                    default:
                        // Handle 'LAB_ORDER' or other unknown types if necessary
                        break;
                }
                return { ...record, details };
            })
        );
        
        // Step 4: Replace the original medical records with the enriched ones
        const finalAppointmentData = {
            ...appointment,
            medicalRecords: enrichedMedicalRecords
        };

        console.log(`[GET /appointments/:id] Successfully found and enriched appointment ${id}.`);
        // Step 5: Return the fully composed appointment object
        return c.json({ data: finalAppointmentData });

    } catch (error: any) {
        console.error(`[GET /appointments/:id] CRASH:`, error);
        return c.json({ message: "Error fetching appointment details", error: error.message }, 500);
    }
});

adminRoutes.post('/appointments/:id/records', zValidator('json', newMedicalRecordSchema), async (c) => {
    const { id: appointmentId } = c.req.param();
    const { recordType, details } = c.req.valid('json');

    try {
        const newRecord = await db.transaction(async (tx) => {
            // Step 1: Create the base medical record entry
            const [baseRecord] = await tx.insert(medicalRecords).values({
                appointmentId,
                recordType,
            }).returning();

            // Step 2: Create the entry in the specialized table
            switch(baseRecord.recordType) {
                case 'DOCTOR_NOTE':
                    // We know 'details' matches the noteSchema here because of the validator
                    const noteDetails = details as z.infer<typeof noteSchema>['details'];
                    await tx.insert(recordDoctorNotes).values({
                        recordId: baseRecord.id,
                        note: noteDetails.note,
                    });
                    break;
                case 'PRESCRIPTION':
                    const presDetails = details as z.infer<typeof prescriptionSchema>['details'];
                    await tx.insert(recordPrescriptions).values({
                        recordId: baseRecord.id,
                        ...presDetails,
                    });
                    break;
                default:
                    // This case should not be hit due to the zod schema, but it's good practice
                    console.error(`Invalid record type processed: ${baseRecord.recordType}`);
                    throw new Error("Invalid record type for this endpoint.");
            }
            return baseRecord;
        });

        // We can re-fetch the full record here if we want to return it,
        // but for now, returning the base record is sufficient.
        return c.json({ data: newRecord }, 201);
        
    } catch (error: any) {
        console.error(`[POST /appointments/:id/records] CRASH:`, error);
        if (error.message.includes("Invalid record type")) {
             return c.json({ error: error.message }, 400);
        }
        return c.json({ message: "Error creating medical record", error: error.message }, 500);
    }
});

const documentUploadSchema = z.object({
  documentName: z.string().min(1, "Document name is required."),
  file: z.instanceof(File, { message: "File is required." }),
});

adminRoutes.post('/appointments/:id/documents', 
    zValidator('form', documentUploadSchema),
    async (c) => {
        const appointmentId = c.req.param('id');
        const { documentName, file } = c.req.valid('form');
        const user = c.get('user');

        // WORKAROUND: Create a new Supabase client to ensure correct storage types
        const env = c.env as AuthEnv['Variables'];
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        // 1. Upload file to Supabase Storage
        const filePath = `${appointmentId}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
            .from('medical_documents')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return c.json({ error: 'Failed to upload file to storage.' }, 500);
        }

        // 2. Create records in the database in a transaction
        try {
            const newDocumentRecord = await db.transaction(async (tx) => {
                const [baseRecord] = await tx.insert(medicalRecords).values({
                    appointmentId,
                    recordType: 'CLINICAL_DOCUMENT',
                    // createdBy: user.id, // Temporarily remove due to schema mismatch
                }).returning();

                const [documentDetail] = await tx.insert(recordDocuments).values({
                    recordId: baseRecord.id,
                    documentName: documentName,
                    filePath: filePath, 
                    fileType: file.type,
                }).returning();

                return { ...baseRecord, details: documentDetail };
            });

            return c.json({ success: true, data: newDocumentRecord }, 201);
        } catch (error: any) {
            console.error("Error creating document record in DB:", error);
            // Attempt to delete the orphaned file from storage
            await supabase.storage.from('medical_documents').remove([filePath]);
            return c.json({ error: 'Failed to save document record.', message: error.message }, 500);
        }
    }
);

adminRoutes
    .get('/users', async (c) => {
        try {
            const allUsers = await db.select().from(profiles);
            return c.json({ data: allUsers });
        } catch (error) {
            console.error('Error fetching users:', error);
            return c.json({ error: 'Internal Server Error', message: 'Failed to fetch users.' }, 500);
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

// Add other admin routes here in the future...

export default adminRoutes;
