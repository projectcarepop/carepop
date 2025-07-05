import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { clinics, profiles, doctors, services, productCategories, products, inventory_items, serviceCategories, appointments, medicalRecords, recordDoctorNotes, recordPrescriptions, recordDocuments, clinicServices } from '../../../drizzle/schema';
import { eq, sql, count, asc, and, gte, lt, getTableColumns, desc, inArray } from 'drizzle-orm';
import { authMiddleware, adminOrManagerMiddleware, AuthEnv } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
adminRoutes.use('*', authMiddleware, adminOrManagerMiddleware);

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

// Schema for creating a new inventory item - THIS IS THE FIX
const createInventoryItemSchema = z.object({
    clinicId: z.string().uuid("A valid clinic ID is required."),
    productCategoryId: z.string().uuid("A valid category ID is required.").optional().nullable(),
    itemName: z.string().min(1, "Item name is required."),
    sku: z.string().optional().nullable(),
    genericName: z.string().optional().nullable(),
    brandName: z.string().optional().nullable(),
    dosageForm: z.string().optional().nullable(),
    strength: z.string().optional().nullable(),
    quantityOnHand: z.coerce.number().int().min(0).optional().default(0),
    reorderLevel: z.coerce.number().int().min(0).default(10),
    purchasePrice: z.coerce.number().optional().nullable(),
    sellingPrice: z.coerce.number().optional().nullable(),
    location: z.string().optional().nullable(),
});

// Schema for updating an existing inventory item - THIS IS THE FIX
const updateInventoryItemSchema = z.object({
    productCategoryId: z.string().uuid("A valid category ID is required.").optional().nullable(),
    itemName: z.string().min(1, "Item name is required.").optional(),
    sku: z.string().optional().nullable(),
    genericName: z.string().optional().nullable(),
    brandName: z.string().optional().nullable(),
    dosageForm: z.string().optional().nullable(),
    strength: z.string().optional().nullable(),
    quantityOnHand: z.coerce.number().int().min(0).optional(),
    reorderLevel: z.coerce.number().int().min(0).optional(),
    purchasePrice: z.coerce.number().optional().nullable(),
    sellingPrice: z.coerce.number().optional().nullable(),
    location: z.string().optional().nullable(),
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

// Zod schema for multipart/form-data
const uploadDocumentSchema = z.object({
  documentName: z.string().min(1, { message: 'Document name is required.' }),
  document: z.instanceof(File, { message: 'A file is required.' }),
});

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
    
    // Step 1: Get the basic clinic data
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));

    if (!clinic) {
      return c.json({ error: 'Not Found' }, 404);
    }

    // Step 2: Get the IDs of all services assigned to this clinic
    const assignedServices = await db.select({
      serviceId: clinicServices.serviceId
    }).from(clinicServices).where(eq(clinicServices.clinicId, id));

    const serviceIds = assignedServices.map(s => s.serviceId);

    // Step 3: Combine and return the data
    const responseData = {
      ...clinic,
      serviceIds: serviceIds,
    };

    return c.json(responseData);
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

// --- Clinic-Service Linking Endpoints ---

/**
 * GET /api/admin/clinics/:id/services
 * Returns an array of service IDs assigned to a specific clinic.
 */
adminRoutes.get('/clinics/:id/services', async (c) => {
    const { id: clinicId } = c.req.param();
    try {
        const assignedServices = await db.select({
            serviceId: clinicServices.serviceId
        }).from(clinicServices).where(eq(clinicServices.clinicId, clinicId));

        // Return a simple array of IDs as requested
        const serviceIds = assignedServices.map(s => s.serviceId);
        return c.json(serviceIds);

    } catch (error: any) {
        console.error(`Error fetching services for clinic ${clinicId}:`, error);
        return c.json({ error: 'Failed to fetch assigned services', message: error.message }, 500);
    }
});

const assignServicesSchema = z.object({
  serviceIds: z.array(z.string().uuid()),
});

/**
 * PUT /api/admin/clinics/:id/services
 * Synchronizes the list of services for a specific clinic.
 */
adminRoutes.put('/clinics/:id/services', zValidator('json', assignServicesSchema), async (c) => {
    const { id: clinicId } = c.req.param();
    const { serviceIds } = c.req.valid('json');

    try {
        await db.transaction(async (tx) => {
            // 1. Delete all existing service assignments for this clinic
            await tx.delete(clinicServices).where(eq(clinicServices.clinicId, clinicId));

            // 2. If there are new service IDs to assign, insert them
            if (serviceIds && serviceIds.length > 0) {
                const newAssignments = serviceIds.map((serviceId: string) => ({
                    clinicId: clinicId,
                    serviceId: serviceId,
                }));
                await tx.insert(clinicServices).values(newAssignments);
            }
        });
        return c.json({ success: true, message: 'Services for clinic updated successfully.' });
    } catch (error: any) {
        console.error("Error updating clinic services:", error);
        return c.json({ error: 'Failed to update services for clinic', message: error.message }, 500);
    }
});

// --- Product Categories Endpoints ---
adminRoutes
  .get('/product-categories', async (c) => {
    const categories = await db.select().from(productCategories).orderBy(asc(productCategories.name));
    return c.json({ data: categories });
  })
  .post('/product-categories', zValidator('json', productCategorySchema), async (c) => {
    const { name, description } = c.req.valid('json');

    // Check for duplicate category name
    const existingCategory = await db.query.productCategories.findFirst({
        where: eq(productCategories.name, name),
    });

    if (existingCategory) {
        return c.json({ error: 'A product category with this name already exists.' }, 409); // 409 Conflict
    }

    const [createdCategory] = await db.insert(productCategories).values({ name, description }).returning();
    return c.json(createdCategory, 201);
  })
  .put('/product-categories/:id', zValidator('json', productCategorySchema.partial()), async (c) => {
    const { id } = c.req.param();
    const { name, description } = c.req.valid('json');

    if (name) {
        // Check if another category with the new name already exists
        const existingCategory = await db.query.productCategories.findFirst({
            where: and(
                eq(productCategories.name, name),
                sql`${productCategories.id} != ${id}`
            ),
        });

        if (existingCategory) {
            return c.json({ error: 'Another product category with this name already exists.' }, 409);
        }
    }

    const [updatedCategory] = await db.update(productCategories).set({ name, description }).where(eq(productCategories.id, id)).returning();
    if (!updatedCategory) return c.json({ error: 'Not Found' }, 404);
    return c.json(updatedCategory);
  })
  .delete('/product-categories/:id', async (c) => {
    const { id } = c.req.param();
    const [deleted] = await db.delete(productCategories).where(eq(productCategories.id, id)).returning({ id: productCategories.id });
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// --- NEW Inventory Management Endpoints ---

// Get all inventory items for a specific clinic
adminRoutes.get('/clinics/:clinicId/inventory', async (c) => {
    const { clinicId } = c.req.param();
    const items = await db.query.inventory_items.findMany({
        where: eq(inventory_items.clinicId, clinicId),
        orderBy: asc(inventory_items.updatedAt),
        with: {
            productCategory: {
                columns: {
                    name: true,
                }
            }
        }
    });
    return c.json({ data: items });
});

// Get all stock for a specific product across all clinics
// THIS ROUTE IS NO LONGER VALID as productId is removed.
// It should be based on a different identifier, like SKU, if needed.
// For now, we will disable it to prevent errors.
/*
adminRoutes.get('/products/:productId/inventory', async (c) => {
    const { productId } = c.req.param();
    const items = await db.query.inventory_items.findMany({
        where: eq(inventory_items.productId, productId),
        with: {
            clinic: {
                columns: { name: true, id: true }
            }
        },
    });
    return c.json({ data: items });
});
*/

// Add a new inventory item/batch to a clinic
adminRoutes.post('/inventory-items', zValidator('json', createInventoryItemSchema), async (c) => {
    const newItemData = c.req.valid('json');

    // Business Rule: Prevent duplicate item names within the same clinic
    const existingItem = await db.query.inventory_items.findFirst({
        where: and(
            eq(inventory_items.clinicId, newItemData.clinicId),
            eq(inventory_items.itemName, newItemData.itemName)
        )
    });

    if (existingItem) {
        return c.json({ error: `'${newItemData.itemName}' is already listed in this clinic's inventory. Please update the existing item's quantity or details instead of adding a duplicate.` }, 409);
    }

    const dbPayload = {
        ...newItemData,
        purchasePrice: newItemData.purchasePrice?.toString(),
        sellingPrice: newItemData.sellingPrice?.toString(),
    };

    // The data from the validator is already in the correct shape for the new schema
    const [createdItem] = await db.insert(inventory_items).values(dbPayload).returning();
    return c.json(createdItem, 201);
});

// Update an existing inventory item
adminRoutes.put('/inventory-items/:itemId', zValidator('json', updateInventoryItemSchema), async (c) => {
    const { itemId } = c.req.param();
    const updatedValues = c.req.valid('json');
    
    const dbPayload = {
        ...updatedValues,
        purchasePrice: updatedValues.purchasePrice?.toString(),
        sellingPrice: updatedValues.sellingPrice?.toString(),
        updatedAt: new Date().toISOString(), // Ensure updatedAt is updated on every modification
    };

    const [updatedItem] = await db.update(inventory_items).set(dbPayload).where(eq(inventory_items.id, itemId)).returning();

    if (!updatedItem) return c.json({ error: 'Inventory item not found' }, 404);
    return c.json(updatedItem);
});

// Delete an inventory item
adminRoutes.delete('/inventory-items/:itemId', async (c) => {
    const { itemId } = c.req.param();
    const [deleted] = await db.delete(inventory_items).where(eq(inventory_items.id, itemId)).returning({ id: inventory_items.id });
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
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
    const appointmentId = c.req.param('id');
    const payload = c.req.valid('json');

    try {
        const newRecordWithDetails = await db.transaction(async (tx) => {
            const [record] = await tx.insert(medicalRecords).values({
                appointmentId: appointmentId,
                recordType: payload.recordType,
            }).returning();

            let details: any = null;

            switch (payload.recordType) {
                case 'DOCTOR_NOTE':
                    [details] = await tx.insert(recordDoctorNotes).values({
                        recordId: record.id,
                        note: payload.details.note,
                    }).returning();
                    break;
                case 'PRESCRIPTION':
                    [details] = await tx.insert(recordPrescriptions).values({
                        recordId: record.id,
                        medication: payload.details.medication,
                        dosage: payload.details.dosage,
                        frequency: payload.details.frequency,
                        startDate: payload.details.startDate,
                        endDate: payload.details.endDate,
                        notes: payload.details.notes,
                    }).returning();
                    break;
            }
            return { ...record, details };
        });

        return c.json({ data: newRecordWithDetails }, 201);

    } catch (error: any) {
        console.error(`Failed to create medical record for appointment ${appointmentId}:`, error);
        return c.json({ error: 'Failed to create medical record', message: error.message }, 500);
    }
});

adminRoutes.post(
  '/appointments/:id/documents',
  zValidator('form', uploadDocumentSchema), // Use 'form' for multipart/form-data
  async (c) => {
    console.log("[UPLOAD_DOC] Endpoint hit.");
    try {
      const { id: appointmentId } = c.req.param();
      const { documentName, document: file } = c.req.valid('form');
      
      console.log(`[UPLOAD_DOC] Received data: appointmentId=${appointmentId}, documentName='${documentName}', fileName='${file.name}', fileSize=${file.size}`);
      
      const supabaseAdmin = createClient(c.env.SUPABASE_URL!, c.env.SUPABASE_SERVICE_ROLE_KEY!);

      // Step 1: Upload to Supabase Storage
      const storagePath = `${appointmentId}/${Date.now()}-${file.name}`;
      console.log(`[UPLOAD_DOC] Attempting to upload to Supabase Storage at path: ${storagePath}`);
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('medical-documents')
        .upload(storagePath, file);

      if (uploadError) {
        console.error("[UPLOAD_DOC] Supabase Storage upload failed:", uploadError);
        throw new Error(`Storage Error: ${uploadError.message}`);
      }
      
      console.log("[UPLOAD_DOC] Supabase Storage upload successful. Path:", uploadData.path);

      // Step 2: Save records to the database in a transaction
      const savedRecord = await db.transaction(async (tx) => {
        console.log("[UPLOAD_DOC] Starting database transaction.");
        const [newMedicalRecord] = await tx
          .insert(medicalRecords)
          .values({
            appointmentId: appointmentId,
            recordType: 'CLINICAL_DOCUMENT',
          })
          .returning();
        
        console.log(`[UPLOAD_DOC] Created medical_records entry with ID: ${newMedicalRecord.id}`);

        const [newDocumentRecord] = await tx
          .insert(recordDocuments)
          .values({
            recordId: newMedicalRecord.id,
            documentName: documentName,
            filePath: uploadData.path, // Using filePath to match schema
            fileType: file.type,
          })
          .returning();
        
        console.log("[UPLOAD_DOC] Created record_documents entry. Transaction complete.");
        return { ...newMedicalRecord, details: newDocumentRecord };
      });
      
      return c.json({ data: savedRecord }, 201);

    } catch (error: any) {
      console.error("[UPLOAD_DOC] CRASH:", error);
      return c.json({ error: 'Internal Server Error', message: error.message }, 500);
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

// --- NEW DASHBOARD METRICS ENDPOINT ---
adminRoutes.get('/dashboard-metrics', async (c) => {
    try {
        // 1. Core Counts
        const [userCount] = await db.select({ count: count() }).from(profiles);
        const [doctorCount] = await db.select({ count: count() }).from(doctors);
        const [clinicCount] = await db.select({ count: count() }).from(clinics);
        const [totalAppointments] = await db.select({ count: count() }).from(appointments);

        // 2. Time-Series Data (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const appointmentsOverTime = await db
            .select({
                date: sql<string>`DATE(appointment_time)`,
                count: sql<number>`count(id)::int`,
            })
            .from(appointments)
            .where(gte(appointments.appointmentTime, thirtyDaysAgo.toISOString()))
            .groupBy(sql`DATE(appointment_time)`)
            .orderBy(sql`DATE(appointment_time)`);

        const usersOverTime = await db
            .select({
                date: sql<string>`DATE(created_at)`,
                count: sql<number>`count(id)::int`,
            })
            .from(profiles)
            .where(gte(profiles.createdAt, thirtyDaysAgo.toISOString()))
            .groupBy(sql`DATE(created_at)`)
            .orderBy(sql`DATE(created_at)`);

        // 3. Aggregate Metrics
        const appointmentsByStatus = await db
            .select({
                status: appointments.status,
                count: sql<number>`count(id)::int`,
            })
            .from(appointments)
            .groupBy(appointments.status);
        
        const topServices = await db
            .select({
                serviceName: services.name,
                count: sql<number>`count(appointments.id)::int`,
            })
            .from(appointments)
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .groupBy(services.name)
            .orderBy(desc(sql<number>`count(appointments.id)::int`))
            .limit(5);

        const topClinics = await db
            .select({
                clinicName: clinics.name,
                count: sql<number>`count(appointments.id)::int`,
            })
            .from(appointments)
            .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
            .groupBy(clinics.name)
            .orderBy(desc(sql<number>`count(appointments.id)::int`))
            .limit(5);

        return c.json({
            data: {
                coreCounts: {
                    users: userCount.count,
                    doctors: doctorCount.count,
                    clinics: clinicCount.count,
                    appointments: totalAppointments.count,
                },
                timeSeries: {
                    appointmentsOverTime,
                    usersOverTime,
                },
                aggregates: {
                    appointmentsByStatus,
                    topServices,
                    topClinics
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching admin dashboard metrics:', error);
        return c.json({ error: 'Failed to fetch dashboard metrics', details: error.message }, 500);
    }
});

adminRoutes.delete('/appointments/:id', async (c) => {
    const { id } = c.req.param();
    const user = c.get('user');

    console.log(`[DELETE /appointments/:id] Admin user ${user?.id} deleting appointment ${id}`);

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
        console.warn(`[DELETE /appointments/:id] Appointment ${id} not found.`);
        return c.json({ error: 'Appointment not found' }, 404);
    }

    // Step 2: Delete all related records in the medicalRecords table
    const deleteRecords = db.delete(medicalRecords).where(eq(medicalRecords.appointmentId, id));

    // Step 3: Delete the appointment itself
    const deleteAppointment = db.delete(appointments).where(eq(appointments.id, id));

    // Step 4: Execute the transaction
    try {
        await db.transaction(async (tx) => {
            // First, delete all records associated with the appointment
            await tx.delete(medicalRecords).where(eq(medicalRecords.appointmentId, id));
            // Then, delete the appointment itself
            await tx.delete(appointments).where(eq(appointments.id, id));
        });

        console.log(`[DELETE /appointments/:id] Successfully deleted appointment ${id}.`);
        return c.json({ success: true, message: `Appointment ${id} and all related records have been deleted.` });
    } catch (error: any) {
        console.error(`[DELETE /appointments/:id] CRASH:`, error);
        return c.json({ message: "Error deleting appointment", error: error.message }, 500);
    }
});


// Add other admin routes here in the future...

export default adminRoutes;
