import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db';
import { 
    clinics, 
    doctors, 
    services, 
    serviceCategories,
    profiles,
    inventory_items,
    productCategories,
    inventoryAuditLog,
    inventoryItemBatches,
    appointments,
    clinicOverrides,
    doctorSchedules,
    doctorAvailabilityOverrides,
    clinicServices,
    doctorClinics,
    recordDoctorNotes,
    recordPrescriptions,
    recordDocuments,
    medicalRecords,
    doctorClinicServices
} from '../../../drizzle/schema';
import { eq, sql, count, asc, and, gte, lt, getTableColumns, desc, inArray, SQL, sum, isNotNull, or, ilike } from 'drizzle-orm';
import { authMiddleware, adminOrManagerMiddleware, AuthEnv } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// =================================================================
// Helper Functions for Availability Calculation
// =================================================================

type TimeSlot = [Date, Date];

// Merges overlapping or adjacent time slots.
function mergeSlots(slots: TimeSlot[]): TimeSlot[] {
    if (slots.length <= 1) return slots;
    slots.sort((a, b) => a[0].getTime() - b[0].getTime());

    const merged: TimeSlot[] = [slots[0]];
    for (let i = 1; i < slots.length; i++) {
        const last = merged[merged.length - 1];
        const current = slots[i];
        if (current[0].getTime() <= last[1].getTime()) {
            last[1] = new Date(Math.max(last[1].getTime(), current[1].getTime()));
        } else {
            merged.push(current);
        }
    }
    return merged;
}

// Adds a new slot and merges the result.
function addSlot(slots: TimeSlot[], newSlot: TimeSlot): TimeSlot[] {
    slots.push(newSlot);
    return mergeSlots(slots);
}

// Subtracts a slot from a list of slots, handling splits and truncations.
function subtractSlot(slots: TimeSlot[], slotToSubtract: TimeSlot): TimeSlot[] {
    const [subStart, subEnd] = slotToSubtract;
    let newSlots: TimeSlot[] = [];

    for (const slot of slots) {
        const [start, end] = slot;

        // No overlap: The current slot is entirely before or after the subtraction slot.
        if (end <= subStart || start >= subEnd) {
            newSlots.push(slot);
            continue;
        }

        // The slot is completely contained within the subtraction slot (it gets removed).
        if (start >= subStart && end <= subEnd) {
            continue;
        }

        // The subtraction slot is contained entirely within the current slot (split).
        if (start < subStart && end > subEnd) {
            newSlots.push([start, subStart]);
            newSlots.push([subEnd, end]);
            continue;
        }

        // The subtraction slot overlaps the beginning of the current slot.
        if (start < subStart && end > subStart) {
            newSlots.push([start, subStart]);
            continue;
        }

        // The subtraction slot overlaps the end of the current slot.
        if (start < subEnd && end > subEnd) {
            newSlots.push([subEnd, end]);
            continue;
        }
    }
    return newSlots;
}

// =================================================================
// Zod Validation Schemas
// =================================================================

export const createClinicOverrideSchema = z.object({
    startDateTime: z.string().datetime(),
    endDateTime: z.string().datetime(),
    reason: z.string().optional(),
    isAvailable: z.boolean().optional().default(false),
});

export const updateClinicOverrideSchema = z.object({
    startDateTime: z.string().datetime().optional(),
    endDateTime: z.string().datetime().optional(),
    reason: z.string().optional(),
    isAvailable: z.boolean().optional(),
});

export const createDoctorScheduleSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // "HH:MM:SS"
    endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
});

export const updateDoctorScheduleSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
});

export const createDoctorOverrideSchema = z.object({
    startDateTime: z.string().datetime(),
    endDateTime: z.string().datetime(),
    isAvailable: z.boolean(),
});

export const updateDoctorOverrideSchema = z.object({
    startDateTime: z.string().datetime().optional(),
    endDateTime: z.string().datetime().optional(),
    isAvailable: z.boolean().optional(),
});

// Other schemas can be added here as needed...

const adminRoutes = new Hono<AuthEnv>();

// --- DIAGNOSTIC MIDDLEWARE ---
adminRoutes.use('*', async (c, next) => {
  console.log(`[ADMIN] Received request for: ${c.req.path}`);
  // We will try to get the user from the authMiddleware's context
  // This will help us see if the auth check is passing before the route handler runs.
  try {
    const user = c.get('user');
    if (user) {
      // Check both Supabase Auth app_metadata and database profile
      const authRole = user.app_metadata?.role;
      console.log(`[ADMIN] Middleware check: User ${user.id} found. Auth role: '${authRole}', Email: '${user.email}'`);
    } else {
      console.log("[ADMIN] Middleware check: No user found in context yet.");
    }
  } catch (e) {
    console.log("[ADMIN] Middleware check: Error accessing user context:", e);
  }
  await next(); // Pass control to the next middleware (auth, admin, then the handler)
});
// --- END DIAGNOSTIC MIDDLEWARE ---

// Apply middleware to all routes in this file
adminRoutes.use('*', authMiddleware, adminOrManagerMiddleware);

// --- Zod Schemas for Validation ---
const createClinicSchema = z.object({
  name: z.string().min(1),
  street: z.string().optional(),
  cityMunicipalityCode: z.string().optional(),
  provinceCode: z.string().optional(),
  zipCode: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  }),
  isActive: z.boolean().optional().default(true),
});

const updateClinicSchema = z.object({
  name: z.string().min(1).optional(),
  street: z.string().optional(),
  cityMunicipalityCode: z.string().optional(),
  provinceCode: z.string().optional(),
  zipCode: z.string().optional(),
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

const batchSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  batchNumber: z.string().optional().nullable(),
  expiryDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "A valid expiry date is required",
  }),
});

// Schema for creating/updating services
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a non-negative number."),
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
  .get('/clinics', zValidator('query', z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    q: z.string().optional(),
  })), async (c) => {
    const { page, limit, q } = c.req.valid('query');
    const offset = (page - 1) * limit;

    const whereConditions = q ? [sql.raw(`LOWER(name) ILIKE LOWER('%${q}%')`)] : [];

    // Fetch total count and data in parallel for efficiency
    const [totalResult, clinicsWithCoords] = await Promise.all([
      db.select({ count: count() }).from(clinics).where(and(...whereConditions)),
      db.select({
        ...getTableColumns(clinics),
        latitude: sql<number>`ST_Y(location::geometry)`,
        longitude: sql<number>`ST_X(location::geometry)`
      }).from(clinics).where(and(...whereConditions)).limit(limit).offset(offset)
    ]);

    const totalCount = totalResult[0]?.count ?? 0;

    return c.json({ 
      data: clinicsWithCoords,
      pagination: {
        page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  })
  .post('/clinics', zValidator('json', createClinicSchema), async (c) => {
    const { name, street, cityMunicipalityCode, provinceCode, zipCode, location, isActive } = c.req.valid('json');
    const point = `POINT(${location.lon} ${location.lat})`;

    const [newClinic] = await db.insert(clinics).values({
      name,
      street,
      cityMunicipalityCode,
      provinceCode,
      zipCode,
      location: sql`ST_GeomFromText(${point}, 4326)`,
      isActive,
    }).returning();
    
    return c.json(newClinic, 201);
  });

// --- Main Clinics Endpoint ---
const getClinicsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().optional(),
});

adminRoutes.get('/clinics', zValidator('query', getClinicsSchema), async (c) => {
  try {
    const { page, limit, q } = c.req.valid('query');
    const offset = (page - 1) * limit;

    const whereClause = q 
      ? or(
          ilike(clinics.name, `%${q}%`),
          ilike(clinics.street, `%${q}%`)
        )
      : undefined;

    const clinicsQuery = db.select({
      ...getTableColumns(clinics),
      latitude: sql<number>`ST_Y(location::geometry)`,
      longitude: sql<number>`ST_X(location::geometry)`
    })
    .from(clinics)
    .where(whereClause)
    .orderBy(asc(clinics.name))
    .limit(limit)
    .offset(offset);

    const totalCountQuery = db.select({ count: count() })
      .from(clinics)
      .where(whereClause);

    const [allClinics, totalResult] = await Promise.all([
      clinicsQuery,
      totalCountQuery
    ]);

    const totalCount = totalResult[0]?.count ?? 0;

    return c.json({
      data: allClinics,
      pagination: {
        page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching clinics:", error);
    return c.json({ error: 'Failed to fetch clinics', message: error.message }, 500);
  }
});

adminRoutes
  .get('/clinics/:id', async (c) => {
    const { id } = c.req.param();
    
    // Step 1: Get the clinic data with extracted coordinates
    const [clinic] = await db.select({
      ...getTableColumns(clinics),
      latitude: sql<number>`ST_Y(location::geometry)`,
      longitude: sql<number>`ST_X(location::geometry)`
    }).from(clinics).where(eq(clinics.id, id));

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

    // This is now a soft delete.
    const [deactivatedClinic] = await db.update(clinics)
        .set({ isActive: false })
        .where(eq(clinics.id, id))
        .returning();

    if (!deactivatedClinic) {
      return c.json({ error: 'Clinic not found' }, 404);
    }
    
    return c.json({ data: deactivatedClinic, message: 'Clinic has been deactivated.' });
  });

// REMOVED DUPLICATE ENDPOINT: The correct management-context endpoint is defined later
// This was causing the wrong data structure to be returned (missing allServices and allDoctors)

const doctorAssignmentsSchema = z.object({
    assignments: z.array(z.object({
        serviceId: z.string().uuid(),
        doctorIds: z.array(z.string().uuid())
    }))
});

adminRoutes.put(
    '/clinics/:id/doctor-assignments',
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('json', doctorAssignmentsSchema),
    async (c) => {
        const { id: clinicId } = c.req.valid('param');
        const { assignments } = c.req.valid('json');

        try {
            await db.transaction(async (tx) => {
                // First, clear all existing assignments for this clinic to ensure a clean slate
                await tx.delete(doctorClinicServices).where(eq(doctorClinicServices.clinicId, clinicId));

                if (assignments.length === 0) {
                    return; // Nothing more to do if the new assignment list is empty
                }

                // Next, build a new list of assignments to insert
                const newAssignments = assignments.flatMap(assignment => 
                    assignment.doctorIds.map(doctorId => ({
                        clinicId: clinicId,
                        serviceId: assignment.serviceId,
                        doctorId: doctorId
                    }))
                );

                // If there are new assignments, insert them all in one go
                if (newAssignments.length > 0) {
                    await tx.insert(doctorClinicServices).values(newAssignments);
                }
            });

            return c.json({ success: true, message: 'Doctor assignments updated successfully.' }, 200);

        } catch (error) {
            console.error('Failed to update doctor assignments:', error);
            return c.json({ success: false, message: 'Failed to update assignments.' }, 500);
        }
    }
);

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

    // Check if any products are using this category
    const productsInCategory = await db.select({ id: inventory_items.id }).from(inventory_items).where(eq(inventory_items.productCategoryId, id)).limit(1);

    if (productsInCategory.length > 0) {
      return c.json({ 
        error: 'Cannot delete category', 
        message: 'This category is still associated with one or more products. Please reassign them before deleting.' 
      }, 409); // 409 Conflict
    }

    try {
        const [deleted] = await db.delete(productCategories).where(eq(productCategories.id, id)).returning({ id: productCategories.id });
        if (!deleted) return c.json({ error: 'Not Found' }, 404);
        return c.json({ success: true, message: 'Category deleted successfully.' });
    } catch (error: any) {
        console.error(`Error deleting product category ${id}:`, error);
        return c.json({ error: 'Failed to delete category', message: error.message }, 500);
    }
  });

// --- Inventory Management ---
const inventoryFilterSchema = z.object({
  lowStock: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  expiringSoon: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  q: z.string().optional(),
});

adminRoutes
  .get('/clinics/:clinicId/inventory', zValidator('query', inventoryFilterSchema), async (c) => {
    const { clinicId } = c.req.param();
    const { lowStock, expiringSoon, q } = c.req.valid('query');
    
    const conditions = [
        eq(inventory_items.clinicId, clinicId)
    ];

    if (lowStock) {
        conditions.push(sql`${inventory_items.quantityOnHand} <= ${inventory_items.reorderLevel}`);
    }
    // The 'expiringSoon' filter is temporarily removed as 'expiryDate' is no longer on this table.
    // This can be re-implemented later by querying the batches table.
    // if (expiringSoon) {
    //     const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    //     conditions.push(sql`inventory_items.expiry_date IS NOT NULL`);
    //     conditions.push(lt(inventory_items.expiry_date, thirtyDaysFromNow.toISOString()));
    // }

    if (q) {
        conditions.push(sql`inventory_items.item_name ilike ${'%' + q + '%'}`);
    }

    const items = await db.select({
        ...getTableColumns(inventory_items),
        categoryName: productCategories.name,
    }).from(inventory_items)
    .leftJoin(productCategories, eq(inventory_items.productCategoryId, productCategories.id))
    .where(and(...conditions.filter((c): c is SQL => !!c)))
    .orderBy(desc(inventory_items.updatedAt));
    
    return c.json({ data: items });
  })
  .get('/clinics/:clinicId/inventory/stats', async (c) => {
    const { clinicId } = c.req.param();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    try {
      const [stats] = await db.select({
        totalProducts: count(inventory_items.id),
        totalQuantity: sum(inventory_items.quantityOnHand).mapWith(Number),
        totalPurchaseValue: sum(sql<number>`${inventory_items.purchasePrice} * ${inventory_items.quantityOnHand}`).mapWith(Number),
        totalSellingValue: sum(sql<number>`${inventory_items.sellingPrice} * ${inventory_items.quantityOnHand}`).mapWith(Number),
      }).from(inventory_items).where(eq(inventory_items.clinicId, clinicId));

      const [lowStockCount] = await db.select({
        count: count()
      }).from(inventory_items).where(and(
        eq(inventory_items.clinicId, clinicId),
        sql`${inventory_items.quantityOnHand} <= ${inventory_items.reorderLevel}`
      ));

      const expiringItems = await db.selectDistinct({ 
        itemId: inventoryItemBatches.itemId 
      }).from(inventoryItemBatches)
        .innerJoin(inventory_items, eq(inventoryItemBatches.itemId, inventory_items.id))
        .where(and(
          eq(inventory_items.clinicId, clinicId),
          isNotNull(inventoryItemBatches.expiryDate),
          lt(inventoryItemBatches.expiryDate, thirtyDaysFromNow)
      ));
      
      const expiringSoonCount = expiringItems.length;

      return c.json({
        data: {
          ...stats,
          lowStockCount: lowStockCount.count,
          expiringSoonCount: expiringSoonCount,
        }
      });
    } catch (error: any) {
        console.error(`Error fetching inventory stats for clinic ${clinicId}:`, error);
        return c.json({ error: 'Failed to fetch inventory stats', message: error.message }, 500);
    }
  })
  .post('/clinics/:clinicId/inventory', zValidator('json', createInventoryItemSchema), async (c) => {
    const { clinicId } = c.req.param();
    const itemData = c.req.valid('json');
    const user = c.get('user');

    if (itemData.clinicId !== clinicId) {
        return c.json({ error: "Clinic ID in URL and body do not match." }, 400);
    }
    
    try {
        const newInventoryItem = await db.transaction(async (tx) => {
            const dbPayload = {
                ...itemData,
                // Ensure empty string SKU is converted to null to respect unique constraint
                sku: itemData.sku || null,
                purchasePrice: itemData.purchasePrice?.toString(),
                sellingPrice: itemData.sellingPrice?.toString(),
            };
            const [item] = await tx.insert(inventory_items).values(dbPayload).returning();

            if (item.quantityOnHand > 0) {
                await tx.insert(inventoryAuditLog).values({
                    itemId: item.id,
                    clinicId: item.clinicId,
                    userId: user.id,
                    changeType: 'initial_stock',
                    quantityChange: item.quantityOnHand,
                    oldQuantity: 0,
                    newQuantity: item.quantityOnHand,
                    reason: 'Initial stock when creating item.',
                });
            }
            return item;
        });

        return c.json(newInventoryItem, 201);
    } catch (error: any) {
        console.error("Error creating inventory item:", error);
        // Check for unique constraint violation (e.g., duplicate SKU)
        if (error.code === '23505') {
            return c.json({ 
                error: "Conflict",
                message: "An item with a similar unique identifier (like SKU) already exists." 
            }, 409);
        }
        return c.json({ error: "Failed to create inventory item.", message: "An unexpected error occurred." }, 500);
    }
  })
  .put('/clinics/:clinicId/inventory/:itemId', zValidator('json', updateInventoryItemSchema), async (c) => {
    const { clinicId, itemId } = c.req.param();
    const itemData = c.req.valid('json');
    const user = c.get('user');

    try {
        const updatedInventoryItem = await db.transaction(async (tx) => {
            const dbPayload: Record<string, any> = { ...itemData };

            if (itemData.purchasePrice !== undefined) {
                dbPayload.purchasePrice = itemData.purchasePrice?.toString();
            }
            if (itemData.sellingPrice !== undefined) {
                dbPayload.sellingPrice = itemData.sellingPrice?.toString();
            }

            if (itemData.quantityOnHand !== undefined) {
                const [currentItem] = await tx.select({
                    quantityOnHand: inventory_items.quantityOnHand
                }).from(inventory_items).where(eq(inventory_items.id, itemId));

                if (!currentItem) throw new Error("Inventory item not found.");
                
                const oldQuantity = currentItem.quantityOnHand;
                const newQuantity = itemData.quantityOnHand;

                const [updatedItem] = await tx.update(inventory_items)
                    .set(dbPayload)
                    .where(and(eq(inventory_items.id, itemId), eq(inventory_items.clinicId, clinicId)))
                    .returning();
                
                if (!updatedItem) throw new Error("Update failed or item does not belong to the specified clinic.");
                
                await tx.insert(inventoryAuditLog).values({
                    itemId: updatedItem.id,
                    clinicId: updatedItem.clinicId,
                    userId: user.id,
                    changeType: 'manual_update',
                    quantityChange: newQuantity - oldQuantity,
                    oldQuantity: oldQuantity,
                    newQuantity: newQuantity,
                    reason: 'Manual stock adjustment by user.',
                });

                return updatedItem;
            } else {
                const [updatedItem] = await tx.update(inventory_items)
                    .set(dbPayload)
                    .where(and(eq(inventory_items.id, itemId), eq(inventory_items.clinicId, clinicId)))
                    .returning();

                if (!updatedItem) throw new Error("Update failed or item not found.");
                
                return updatedItem;
            }
        });

        return c.json(updatedInventoryItem);
    } catch (error: any) {
        console.error("Error updating inventory item:", error);
        // Check for unique constraint violation
        if (error.code === '23505') {
            return c.json({ 
                error: "Conflict", 
                message: "An item with a similar unique identifier (like SKU) already exists."
            }, 409);
        }
        return c.json({ error: "Failed to update inventory item.", message: "An unexpected error occurred." }, 500);
    }
  })
  .delete('/clinics/:clinicId/inventory/:itemId', async (c) => {
    const { clinicId, itemId } = c.req.param();
    const user = c.get('user');
    
    try {
      const deletedItems = await db.transaction(async (tx) => {
        const [currentItem] = await tx.select({
            id: inventory_items.id, // We need the ID for the audit log
            quantityOnHand: inventory_items.quantityOnHand,
            clinicId: inventory_items.clinicId // And the clinicId
        }).from(inventory_items).where(and(eq(inventory_items.id, itemId), eq(inventory_items.clinicId, clinicId)));

        if (!currentItem) {
            // Throw an error to be caught by the outer catch block, which will return a 404.
            throw new Error('Item not found in this clinic.');
        }

        // FIX: Log the deletion *before* the item is deleted to maintain foreign key constraint.
        await tx.insert(inventoryAuditLog).values({
            itemId: currentItem.id,
            clinicId: currentItem.clinicId,
            userId: user.id,
            changeType: 'deletion',
            quantityChange: -currentItem.quantityOnHand,
            oldQuantity: currentItem.quantityOnHand,
            newQuantity: 0,
            reason: 'Item deleted from inventory.',
        });
        
        const [deleted] = await tx.delete(inventory_items)
            .where(and(eq(inventory_items.id, itemId), eq(inventory_items.clinicId, clinicId)))
            .returning({ id: inventory_items.id });
        
        return deleted;
      });
      
      if (!deletedItems) {
          return c.json({ error: 'Item not found or does not belong to this clinic.'}, 404);
      }

      return c.json({ success: true, message: 'Item deleted successfully.' });

    } catch (error: any) {
      console.error(`Error deleting inventory item ${itemId}:`, error);
      if (error.message.includes('Item not found')) {
        return c.json({ error: 'Item not found or does not belong to this clinic.' }, 404);
      }
      return c.json({ error: 'Failed to delete item', message: error.message }, 500);
    }
  });

// --- NEW: Inventory Item Batch Management ---
adminRoutes
    .get('/inventory-items/:itemId/batches', async (c) => {
        const { itemId } = c.req.param();
        const batches = await db.select()
            .from(inventoryItemBatches)
            .where(eq(inventoryItemBatches.itemId, itemId))
            .orderBy(desc(inventoryItemBatches.expiryDate));
        return c.json({ data: batches });
    })
    .post('/inventory-items/:itemId/batches', zValidator('json', batchSchema), async (c) => {
        const { itemId } = c.req.param();
        const batchData = c.req.valid('json');
        
        const [newBatch] = await db.insert(inventoryItemBatches).values({
            itemId,
            ...batchData,
            expiryDate: new Date(batchData.expiryDate as string),
        }).returning();

        // After adding a batch, we MUST update the main item's total quantity
        await db.execute(sql`
            UPDATE ${inventory_items}
            SET quantity_on_hand = (
                SELECT SUM(quantity)
                FROM ${inventoryItemBatches}
                WHERE item_id = ${itemId}
            )
            WHERE id = ${itemId};
        `);

        return c.json({ data: newBatch }, 201);
    });

adminRoutes
    .delete('/inventory-item-batches/:batchId', async (c) => {
        const { batchId } = c.req.param();
        
        const [deletedBatch] = await db.delete(inventoryItemBatches)
            .where(eq(inventoryItemBatches.id, batchId))
            .returning({ itemId: inventoryItemBatches.itemId });

        if (deletedBatch) {
            // After deleting a batch, we MUST update the main item's total quantity
             await db.execute(sql`
                UPDATE ${inventory_items}
                SET quantity_on_hand = (
                    SELECT COALESCE(SUM(quantity), 0)
                    FROM ${inventoryItemBatches}
                    WHERE item_id = ${deletedBatch.itemId}
                )
                WHERE id = ${deletedBatch.itemId};
            `);
        }
        
        return c.json({ success: true });
    });

// --- Doctor Management Endpoints ---

adminRoutes.get(
  '/doctors',
  zValidator('query', z.object({ clinicId: z.string().uuid().optional() })),
  async (c) => {
    const { clinicId } = c.req.valid('query');

    const allDoctors = await db.query.doctors.findMany({
      orderBy: [asc(doctors.fullName)],
      with: {
        doctorClinics: {
          columns: {
            clinicId: true,
          },
        },
      },
    });

    if (clinicId) {
      const filtered = allDoctors.filter(d =>
        d.doctorClinics.some(dc => dc.clinicId === clinicId)
      );
      return c.json({ data: filtered });
    }

    return c.json({ data: allDoctors });
  }
);

adminRoutes.get(
    '/doctors/:id/service-context',
    zValidator('param', z.object({ id: z.string().uuid() })),
    async (c) => {
        const { id: doctorId } = c.req.valid('param');

        // CORRECTED: Fetch the doctor's clinic link first
        const doctorClinicLink = await db.query.doctorClinics.findFirst({
            where: eq(doctorClinics.doctorId, doctorId),
            columns: { clinicId: true }
        });

        if (!doctorClinicLink || !doctorClinicLink.clinicId) {
            return c.json({ availableServices: [], assignedServiceIds: [] });
        }

        const { clinicId } = doctorClinicLink;

        const availableClinicServices = await db.query.clinicServices.findMany({
            where: eq(clinicServices.clinicId, clinicId),
            with: { service: true }
        });
        
        const availableServices = availableClinicServices.map(cs => cs.service).filter(Boolean);

        const assignedDoctorServices = await db.query.doctorClinicServices.findMany({
            where: and(
                eq(doctorClinicServices.doctorId, doctorId),
                eq(doctorClinicServices.clinicId, clinicId)
            ),
            columns: { serviceId: true }
        });
        
        const assignedServiceIds = assignedDoctorServices.map(ds => ds.serviceId);

        return c.json({
            availableServices,
            assignedServiceIds
        });
    }
);

adminRoutes.put(
    '/doctors/:id/services',
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('json', z.object({ serviceIds: z.array(z.string().uuid()) })),
    async (c) => {
        const { id: doctorId } = c.req.valid('param');
        const { serviceIds } = c.req.valid('json');

        const doctorClinicLink = await db.query.doctorClinics.findFirst({
            where: eq(doctorClinics.doctorId, doctorId),
            columns: { clinicId: true }
        });

        if (!doctorClinicLink || !doctorClinicLink.clinicId) {
            return c.json({ message: "Doctor not found or not assigned to a clinic" }, 404);
        }
        const { clinicId } = doctorClinicLink;

        try {
            await db.transaction(async (tx) => {
                await tx.delete(doctorClinicServices).where(
                    and(
                        eq(doctorClinicServices.doctorId, doctorId),
                        eq(doctorClinicServices.clinicId, clinicId)
                    )
                );

                if (serviceIds.length > 0) {
                    const newAssignments = serviceIds.map(serviceId => ({
                        doctorId,
                        clinicId,
                        serviceId,
                    }));
                    await tx.insert(doctorClinicServices).values(newAssignments);
                }
            });
        } catch (error) {
            console.error("Failed to update doctor services:", error);
            return c.json({ message: "Failed to update doctor services", error: (error as Error).message }, 500);
        }
        
        return c.json({ message: "Doctor services updated successfully" }, 200);
    }
);

// NEW: Centralized schema for upserting doctors
const upsertDoctorSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  specialtyText: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  clinicIds: z.array(z.string().uuid()).optional().default([]),
});

// /api/admin/doctors (CREATE)
adminRoutes.post(
  '/doctors',
  zValidator('json', upsertDoctorSchema),
  async (c) => {
    const doctorData = c.req.valid('json');
    
    try {
      const newDoctor = await db.transaction(async (tx) => {
        const [createdDoctor] = await tx.insert(doctors).values({
          fullName: doctorData.fullName,
          specialtyText: doctorData.specialtyText,
          bio: doctorData.bio,
          isActive: doctorData.isActive,
        }).returning();

        if (doctorData.clinicIds && doctorData.clinicIds.length > 0) {
          const clinicAssignments = doctorData.clinicIds.map(clinicId => ({
            doctorId: createdDoctor.id,
            clinicId: clinicId
          }));
          await tx.insert(doctorClinics).values(clinicAssignments);
        }
        
        return createdDoctor;
      });

      return c.json(newDoctor, 201);
  } catch (error) {
      console.error('Failed to create doctor:', error);
      return c.json({ error: 'Failed to create doctor' }, 500);
    }
  }
);


// /api/admin/doctors/:id (UPDATE)
adminRoutes.put(
  '/doctors/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', upsertDoctorSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const doctorData = c.req.valid('json');

    try {
      const updatedDoctor = await db.transaction(async (tx) => {
        // Step 1: Update the doctor's core details
        const [result] = await tx.update(doctors).set({
          fullName: doctorData.fullName,
          specialtyText: doctorData.specialtyText,
          bio: doctorData.bio,
          isActive: doctorData.isActive,
        }).where(eq(doctors.id, id)).returning();

        if (!result) {
          // This will abort the transaction
          throw new Error("Doctor not found");
        }
        
        // Step 2: Clear existing clinic associations for this doctor
        await tx.delete(doctorClinics).where(eq(doctorClinics.doctorId, id));

        // Step 3: Insert the new clinic associations
        if (doctorData.clinicIds && doctorData.clinicIds.length > 0) {
          const newAssignments = doctorData.clinicIds.map((clinicId) => ({
            doctorId: id,
            clinicId: clinicId,
          }));
          await tx.insert(doctorClinics).values(newAssignments);
        }

        return result;
      });

    return c.json(updatedDoctor);
    } catch (error: any) {
        console.error('Failed to update doctor:', error);
        if (error.message === "Doctor not found") {
            return c.json({ error: 'Doctor not found' }, 404);
        }
        return c.json({ error: 'Failed to update doctor' }, 500);
    }
  }
);


// /api/admin/doctors/:id (DELETE)
adminRoutes.delete('/doctors/:id', zValidator('param', z.object({ id: z.string().uuid() })), async (c) => {
    const { id } = c.req.valid('param');
    const [deleted] = await db.delete(doctors).where(eq(doctors.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// --- Service Management Endpoints ---
const getServicesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().optional(),
});

adminRoutes.get('/services', zValidator('query', getServicesSchema), async (c) => {
  console.log("[GET /services] Handler started.");
  try {
    const { page, limit, q } = c.req.valid('query');
    const offset = (page - 1) * limit;

    const whereClause = q 
      ? or(
          ilike(services.name, `%${q}%`),
          ilike(serviceCategories.name, `%${q}%`)
        )
      : undefined;

    const servicesQuery = db.select({
      ...getTableColumns(services),
      serviceCategory: {
        id: serviceCategories.id,
        name: serviceCategories.name,
      },
    })
    .from(services)
    .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(whereClause)
    .orderBy(desc(services.name))
    .limit(limit)
    .offset(offset);

    const totalCountQuery = db.select({ count: count() })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(whereClause);

    const [allServices, totalResult] = await Promise.all([
      servicesQuery,
      totalCountQuery
    ]);

    const totalCount = totalResult[0]?.count ?? 0;

    console.log(`[GET /services] Successfully fetched ${allServices.length} services (page ${page}).`);
    return c.json({
      data: allServices,
      pagination: {
        page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("[GET /services] CRASH:", error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

adminRoutes.post('/services', zValidator('json', serviceSchema), async (c) => {
    console.log('[POST /services] Handler reached. Body validation passed.');
    const newServiceData = c.req.valid('json');
    const [createdService] = await db.insert(services).values({
        ...newServiceData,
        price: newServiceData.price.toString(),
    }).returning();
    return c.json(createdService, 201);
});

adminRoutes.put('/services/:id', zValidator('json', serviceSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const values = c.req.valid('json');

    const payload: { [key: string]: any } = { ...values };

    if (values.price !== undefined) {
        payload.price = values.price.toString();
    }

    const [updatedService] = await db.update(services).set(payload).where(eq(services.id, id)).returning();
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
const getServiceCategoriesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().optional(),
});

adminRoutes
  .get('/service-categories', zValidator('query', getServiceCategoriesSchema), async (c) => {
    try {
      const { page, limit, q } = c.req.valid('query');
      const offset = (page - 1) * limit;

      const whereClause = q 
        ? or(
            ilike(serviceCategories.name, `%${q}%`),
            ilike(serviceCategories.description, `%${q}%`)
          )
        : undefined;

      const categoriesQuery = db.select()
        .from(serviceCategories)
        .where(whereClause)
        .orderBy(asc(serviceCategories.name))
        .limit(limit)
        .offset(offset);

      const totalCountQuery = db.select({ count: count() })
        .from(serviceCategories)
        .where(whereClause);

      const [categories, totalResult] = await Promise.all([
        categoriesQuery,
        totalCountQuery
      ]);

      const totalCount = totalResult[0]?.count ?? 0;

      return c.json({
        data: categories,
        pagination: {
          page,
          pageSize: limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error: any) {
      console.error("Error fetching service categories:", error);
      return c.json({ error: 'Failed to fetch service categories', message: error.message }, 500);
    }
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
    
    // Check if any services are using this category
    const servicesInCategory = await db.select({ id: services.id }).from(services).where(eq(services.categoryId, id)).limit(1);

    if (servicesInCategory.length > 0) {
      return c.json({ 
        error: 'Cannot delete category', 
        message: 'This category is still associated with one or more services. Please reassign them before deleting.' 
      }, 409); // 409 Conflict
    }

    const [deleted] = await db.delete(serviceCategories).where(eq(serviceCategories.id, id)).returning();
    if (!deleted) return c.json({ error: 'Not Found' }, 404);
    return c.json({ success: true });
  });

// --- Appointment Management Endpoints ---
const getAppointmentsSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    patientName: z.string().optional(),
});

adminRoutes.get('/appointments', zValidator('query', getAppointmentsSchema), async (c) => {
    try {
        const { page, limit, patientName } = c.req.valid('query');
        const offset = (page - 1) * limit;

        const whereClause = patientName 
            ? or(
                ilike(profiles.firstName, `%${patientName}%`),
                ilike(profiles.lastName, `%${patientName}%`)
              )
            : undefined;
        
        const appointmentsQuery = db.select({
            ...getTableColumns(appointments),
            clinicName: clinics.name,
            doctorName: doctors.fullName,
            patientName: sql<string>`COALESCE(TRIM(COALESCE(${profiles.firstName}, '') || ' ' || COALESCE(${profiles.lastName}, '')), 'Unknown Patient')`,
        })
        .from(appointments)
        .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .leftJoin(profiles, eq(appointments.patientId, profiles.id))
        .where(whereClause)
        .orderBy(desc(appointments.appointmentTime))
        .limit(limit)
        .offset(offset);

        const totalCountQuery = db.select({ count: count() })
            .from(appointments)
            .leftJoin(profiles, eq(appointments.patientId, profiles.id))
            .where(whereClause);
        
        const [allAppointments, totalResult] = await Promise.all([
            appointmentsQuery,
            totalCountQuery
        ]);
        
        const totalCount = totalResult[0]?.count ?? 0;

        return c.json({
            data: allAppointments,
            pagination: {
                page,
                pageSize: limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return c.json({ error: 'Failed to fetch appointments', message: error.message }, 500);
    }
});

adminRoutes.get('/appointments/:id', async (c) => {
    try {
        const { id } = c.req.param();
        if (!id) {
            return c.json({ error: 'Appointment ID is required' }, 400);
        }

        const [appointmentDetails] = await db.select({
            ...getTableColumns(appointments),
            clinicName: clinics.name,
            doctorName: doctors.fullName,
            patientName: sql<string>`COALESCE(TRIM(COALESCE(${profiles.firstName}, '') || ' ' || COALESCE(${profiles.lastName}, '')), 'Unknown Patient')`,
            serviceName: services.name,
            servicePrice: services.price,
        })
        .from(appointments)
        .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .leftJoin(profiles, eq(appointments.patientId, profiles.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .where(eq(appointments.id, id));


        if (!appointmentDetails) {
            return c.json({ error: 'Appointment not found' }, 404);
        }

        return c.json({ data: appointmentDetails });
    } catch (error: any) {
        console.error("Error fetching appointment details:", error);
        return c.json({ error: 'Failed to fetch appointment details', message: error.message }, 500);
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

// --- User Management ---

const getUsersSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().optional(),
  role: z.string().optional(),
});

adminRoutes
    .get('/users', zValidator('query', getUsersSchema), async (c) => {
        try {
            const { page, limit, q, role } = c.req.valid('query');
            const offset = (page - 1) * limit;

            const whereClause = q 
                ? or(
                    ilike(profiles.firstName, `%${q}%`),
                    ilike(profiles.lastName, `%${q}%`),
                    ilike(profiles.email, `%${q}%`)
                  )
                : undefined;

            const usersQuery = db.select()
                .from(profiles)
                .where(whereClause)
                .orderBy(asc(profiles.firstName), asc(profiles.lastName))
                .limit(limit)
                .offset(offset);

            const totalCountQuery = db.select({ count: count() })
                .from(profiles)
                .where(whereClause);

            const [userProfiles, totalResult] = await Promise.all([
                usersQuery,
                totalCountQuery
            ]);

            const totalCount = totalResult[0]?.count ?? 0;

            return c.json({
                data: userProfiles,
                pagination: {
                    page,
                    pageSize: limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            });
        } catch (error: any) {
            console.error("Error fetching user profiles:", error);
            return c.json({ error: "Failed to fetch user profiles", details: error.message }, 500);
        }
    })
    .get('/users/:userId', async (c) => {
        const { userId } = c.req.param();
        const supabase = c.get('supabase');

        const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

        if (error) {
            return c.json({ error: "Failed to fetch user", details: error.message }, 500);
        }
        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json({ data: user });
    })
    .patch('/users/:userId/role', zValidator('json', updateUserRoleSchema), async (c) => {
        const { userId } = c.req.param();
        const { role } = c.req.valid('json');
        const supabase = c.get('supabase');

        const { data, error } = await supabase.auth.admin.updateUserById(
            userId,
            { app_metadata: { role: role } }
        );

        if (error) {
            return c.json({ error: "Failed to update user role", details: error.message }, 500);
        }

        return c.json({ data: data.user });
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

adminRoutes.patch(
  '/appointments/:id/cancel',
  zValidator('json', z.object({ reason: z.string().min(1, { message: "Cancellation reason is required."}) })),
  async (c) => {
    const { id } = c.req.param();
    const { reason } = c.req.valid('json');
    try {
        const [updatedAppointment] = await db.update(appointments)
            .set({
                status: 'canceled_by_admin',
                cancellationReason: reason
            })
            .where(eq(appointments.id, id))
            .returning();

        if (!updatedAppointment) {
            return c.json({ error: "Appointment not found or could not be updated." }, 404);
        }
        return c.json({ data: updatedAppointment });
    } catch (e: any) {
        return c.json({ error: 'Internal Server Error', message: e.message }, 500);
    }
});

// =================================================================
// Availability Management Endpoints
// =================================================================

// --- Clinic-Wide Overrides ---
adminRoutes
  // Get all overrides for a specific clinic
  .get('/clinics/:clinicId/overrides', zValidator('param', z.object({ clinicId: z.string().uuid() })), async (c) => {
    const { clinicId } = c.req.valid('param');
    try {
      const overrides = await db.query.clinicOverrides.findMany({
        where: eq(clinicOverrides.clinicId, clinicId),
        orderBy: asc(clinicOverrides.startDateTime),
      });
      return c.json({ data: overrides });
        } catch (error) {
      console.error(`Failed to fetch overrides for clinic ${clinicId}:`, error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
  })
  // Create a new override for a clinic
  .post('/clinics/:clinicId/overrides', zValidator('param', z.object({ clinicId: z.string().uuid() })), zValidator('json', createClinicOverrideSchema), async (c) => {
    const { clinicId } = c.req.valid('param');
    const overrideData = c.req.valid('json');
    try {
      const [newOverride] = await db.insert(clinicOverrides).values({
        ...overrideData,
        clinicId,
      }).returning();
      return c.json({ data: newOverride }, 201);
    } catch (error) {
      console.error(`Failed to create override for clinic ${clinicId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

adminRoutes
  // Update a specific override
  .put('/overrides/:overrideId', zValidator('param', z.object({ overrideId: z.string().uuid() })), zValidator('json', updateClinicOverrideSchema), async (c) => {
    const { overrideId } = c.req.valid('param');
    const overrideData = c.req.valid('json');
    try {
      const [updatedOverride] = await db.update(clinicOverrides)
        .set(overrideData)
                .where(eq(clinicOverrides.id, overrideId))
                .returning();

            if (!updatedOverride) {
                return c.json({ error: 'Override not found' }, 404);
            }
      return c.json({ data: updatedOverride });
        } catch (error) {
      console.error(`Failed to update override ${overrideId}:`, error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
  })
  // Delete a specific override
  .delete('/overrides/:overrideId', zValidator('param', z.object({ overrideId: z.string().uuid() })), async (c) => {
    const { overrideId } = c.req.valid('param');
    try {
      const [deletedOverride] = await db.delete(clinicOverrides)
        .where(eq(clinicOverrides.id, overrideId))
        .returning();
      
        if (!deletedOverride) {
            return c.json({ error: 'Override not found' }, 404);
        }
      return c.json({ message: 'Override deleted successfully' }, 200);
    } catch (error) {
      console.error(`Failed to delete override ${overrideId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// --- Doctor Schedules & Overrides ---

adminRoutes
  // Get all recurring schedules for a specific doctor
  .get('/doctors/:doctorId/schedules', zValidator('param', z.object({ doctorId: z.string().uuid() })), async (c) => {
    const { doctorId } = c.req.valid('param');
    try {
      const schedules = await db.query.doctorSchedules.findMany({
        where: eq(doctorSchedules.doctorId, doctorId),
        orderBy: asc(doctorSchedules.dayOfWeek),
      });
        return c.json({ data: schedules });
    } catch (error) {
      console.error(`Failed to fetch schedules for doctor ${doctorId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  // Create a new recurring schedule for a doctor
  .post('/doctors/:doctorId/schedules', zValidator('param', z.object({ doctorId: z.string().uuid() })), zValidator('json', createDoctorScheduleSchema), async (c) => {
    const { doctorId } = c.req.valid('param');
        const scheduleData = c.req.valid('json');
    try {
      const [newSchedule] = await db.insert(doctorSchedules).values({
        ...scheduleData,
        doctorId,
      }).returning();
      return c.json({ data: newSchedule }, 201);
        } catch (error) {
      console.error(`Failed to create schedule for doctor ${doctorId}:`, error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
  });

adminRoutes
  // Update a specific recurring schedule
  .put('/schedules/:scheduleId', zValidator('param', z.object({ scheduleId: z.string().uuid() })), zValidator('json', updateDoctorScheduleSchema), async (c) => {
    const { scheduleId } = c.req.valid('param');
    const scheduleData = c.req.valid('json');
    try {
      const [updatedSchedule] = await db.update(doctorSchedules)
        .set({ ...scheduleData, updatedAt: new Date().toISOString() })
        .where(eq(doctorSchedules.id, scheduleId))
                .returning();

      if (!updatedSchedule) {
        return c.json({ error: 'Schedule not found' }, 404);
      }
      return c.json({ data: updatedSchedule });
        } catch (error) {
      console.error(`Failed to update schedule ${scheduleId}:`, error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
  })
  // Delete a specific recurring schedule
  .delete('/schedules/:scheduleId', zValidator('param', z.object({ scheduleId: z.string().uuid() })), async (c) => {
    const { scheduleId } = c.req.valid('param');
    try {
      const [deletedSchedule] = await db.delete(doctorSchedules)
        .where(eq(doctorSchedules.id, scheduleId))
        .returning();
      
      if (!deletedSchedule) {
        return c.json({ error: 'Schedule not found' }, 404);
      }
      return c.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error(`Failed to delete schedule ${scheduleId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

adminRoutes
  // Get all one-off overrides for a specific doctor
  .get('/doctors/:doctorId/overrides', zValidator('param', z.object({ doctorId: z.string().uuid() })), async (c) => {
    const { doctorId } = c.req.valid('param');
    try {
      const overrides = await db.query.doctorAvailabilityOverrides.findMany({
        where: eq(doctorAvailabilityOverrides.doctorId, doctorId),
        orderBy: asc(doctorAvailabilityOverrides.startDateTime),
      });
      return c.json({ data: overrides });
        } catch (error) {
      console.error(`Failed to fetch overrides for doctor ${doctorId}:`, error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
  })
  // Create a new one-off override for a doctor
  .post('/doctors/:doctorId/overrides', zValidator('param', z.object({ doctorId: z.string().uuid() })), zValidator('json', createDoctorOverrideSchema), async (c) => {
    const { doctorId } = c.req.valid('param');
    const overrideData = c.req.valid('json');
    try {
      const [newOverride] = await db.insert(doctorAvailabilityOverrides).values({
        ...overrideData,
        doctorId,
      }).returning();
      return c.json({ data: newOverride }, 201);
    } catch (error) {
      console.error(`Failed to create override for doctor ${doctorId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

adminRoutes
  // Update a specific doctor override
  .put('/doctor-overrides/:overrideId', zValidator('param', z.object({ overrideId: z.string().uuid() })), zValidator('json', updateDoctorOverrideSchema), async (c) => {
    const { overrideId } = c.req.valid('param');
    const overrideData = c.req.valid('json');
    try {
      const [updatedOverride] = await db.update(doctorAvailabilityOverrides)
        .set(overrideData)
        .where(eq(doctorAvailabilityOverrides.id, overrideId))
        .returning();

      if (!updatedOverride) {
        return c.json({ error: 'Doctor override not found' }, 404);
      }
      return c.json({ data: updatedOverride });
    } catch (error) {
      console.error(`Failed to update doctor override ${overrideId}:`, error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  // Delete a specific doctor override
  .delete('/doctor-overrides/:overrideId', zValidator('param', z.object({ overrideId: z.string().uuid() })), async (c) => {
    const { overrideId } = c.req.valid('param');
    try {
      const [deletedOverride] = await db.delete(doctorAvailabilityOverrides)
        .where(eq(doctorAvailabilityOverrides.id, overrideId))
        .returning();
      
      if (!deletedOverride) {
        return c.json({ error: 'Doctor override not found' }, 404);
      }
      return c.json({ message: 'Doctor override deleted successfully' });
    } catch (error) {
      console.error(`Failed to delete doctor override ${overrideId}:`, error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// --- Availability Calculation Endpoint ---
adminRoutes.get('/doctors/:doctorId/calculated-availability',
  zValidator('param', z.object({ doctorId: z.string().uuid() })),
  zValidator('query', z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid startDate format, expected YYYY-MM-DD" }),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid endDate format, expected YYYY-MM-DD" }),
  })),
    async (c) => {
    const { doctorId } = c.req.valid('param');
    const { startDate, endDate } = c.req.valid('query');

    try {
      const queryEndDate = new Date(endDate);
      queryEndDate.setDate(queryEndDate.getDate() + 1);

      // 1. Fetch all data in parallel
      const [schedules, doctorOverrides, doctorClinicLinks] = await Promise.all([
        db.query.doctorSchedules.findMany({ where: eq(doctorSchedules.doctorId, doctorId) }),
        db.query.doctorAvailabilityOverrides.findMany({
          where: and(
            eq(doctorAvailabilityOverrides.doctorId, doctorId),
            gte(doctorAvailabilityOverrides.endDateTime, startDate),
            lt(doctorAvailabilityOverrides.startDateTime, queryEndDate.toISOString())
          )
        }),
        db.query.doctorClinics.findMany({ where: eq(doctorClinics.doctorId, doctorId) })
      ]);

      const clinicIds = doctorClinicLinks.map(link => link.clinicId);
      
      // Define the type explicitly to avoid circular reference
      type ClinicOverride = typeof import('../../../drizzle/schema').clinicOverrides.$inferSelect;
      let clinicOverridesList: ClinicOverride[] = [];

      if (clinicIds.length > 0) {
        clinicOverridesList = await db.query.clinicOverrides.findMany({
          where: and(
            inArray(clinicOverrides.clinicId, clinicIds),
            gte(clinicOverrides.endDateTime, startDate),
            lt(clinicOverrides.startDateTime, queryEndDate.toISOString())
          )
        });
      }

      // 2. Structure data for fast lookups
      const scheduleMap = new Map(schedules.map(s => [s.dayOfWeek, { startTime: s.startTime, endTime: s.endTime }]));
      
      const buildOverrideMap = (overrides: any[]) => {
        const map = new Map<string, any[]>();
        for (const override of overrides) {
            let cursor = new Date(override.startDateTime);
            let endDate = new Date(override.endDateTime);
            while(cursor < endDate) {
                const dateKey = cursor.toISOString().split('T')[0];
                if (!map.has(dateKey)) map.set(dateKey, []);
                map.get(dateKey)!.push(override);
                cursor.setDate(cursor.getDate() + 1);
            }
        }
        return map;
      };
      const doctorOverrideMap = buildOverrideMap(doctorOverrides);
      const clinicOverrideMap = buildOverrideMap(clinicOverridesList);
      
      // 3. Loop through each day and calculate availability
      const availabilityResult: Record<string, { status: string; slots: string[]; reason?: string }> = {};
      const currentDate = new Date(`${startDate}T00:00:00Z`);
      const finalDate = new Date(`${endDate}T00:00:00Z`);

      const timeToDate = (timeStr: string, date: Date): Date => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setUTCHours(hours, minutes, seconds, 0);
        return newDate;
      };

      while (currentDate <= finalDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        let availableSlots: TimeSlot[] = [];

        // A. Start with base recurring schedule
        const dayOfWeek = currentDate.getUTCDay();
        const baseSchedule = scheduleMap.get(dayOfWeek);
        if (baseSchedule) {
          availableSlots.push([
            timeToDate(baseSchedule.startTime, currentDate),
            timeToDate(baseSchedule.endTime, currentDate)
          ]);
        }

        // B. Apply clinic-wide overrides
        const dailyClinicOverrides = clinicOverrideMap.get(dateKey) || [];
        for (const override of dailyClinicOverrides) {
          const overrideSlot: TimeSlot = [new Date(override.startDateTime), new Date(override.endDateTime)];
          if (override.isAvailable) {
            availableSlots = addSlot(availableSlots, overrideSlot);
          } else {
            availableSlots = subtractSlot(availableSlots, overrideSlot);
          }
        }

        // C. Apply doctor-specific overrides
        const dailyDoctorOverrides = doctorOverrideMap.get(dateKey) || [];
        for (const override of dailyDoctorOverrides) {
          const overrideSlot: TimeSlot = [new Date(override.startDateTime), new Date(override.endDateTime)];
          if (override.isAvailable) {
            availableSlots = addSlot(availableSlots, overrideSlot);
          } else {
            availableSlots = subtractSlot(availableSlots, overrideSlot);
          }
        }
        
        // D. Determine final status and format slots
        if (availableSlots.length > 0) {
          const formattedSlots = availableSlots.map(([start, end]) => 
            `${start.getUTCHours().toString().padStart(2, '0')}:${start.getUTCMinutes().toString().padStart(2, '0')}-` +
            `${end.getUTCHours().toString().padStart(2, '0')}:${end.getUTCMinutes().toString().padStart(2, '0')}`
          );
          
          let status = 'available';
          if (dailyDoctorOverrides.length > 0 || dailyClinicOverrides.length > 0) {
              status = 'partial'; // Or some other logic to determine if it's truly "partial"
          }

          availabilityResult[dateKey] = { status, slots: formattedSlots };
        } else {
          availabilityResult[dateKey] = { status: 'unavailable', slots: [] };
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      return c.json({ data: availabilityResult });

    } catch (error: any) {
      console.error(`Failed to calculate availability for doctor ${doctorId}:`, error);
      return c.json({ error: 'Internal Server Error', message: error.message }, 500);
    }
  }
);

// --- CORRECTED NEW ENDPOINT to get doctors by clinic ---
adminRoutes.get('/clinics/:clinicId/doctors', async (c) => {
    const { clinicId } = c.req.param();
    
    if (!clinicId) {
        return c.json({ error: 'Clinic ID is required' }, 400);
    }

    try {
        const doctorList = await db
            .select({
            id: doctors.id,
            fullName: doctors.fullName,
            specialtyText: doctors.specialtyText,
                bio: doctors.bio,
                avatarUrl: doctors.avatarUrl,
                isActive: doctors.isActive,
        })
        .from(doctors)
            .innerJoin(doctorClinics, eq(doctors.id, doctorClinics.doctorId))
            .where(eq(doctorClinics.clinicId, clinicId));

        // It's better to return an empty array if no doctors are found,
        // as this is not an error condition. The frontend can handle an empty list.
        return c.json({ data: doctorList });
    } catch (error) {
        console.error('Error fetching doctors for clinic:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// =================================================================
// Clinic-Wide Master Schedule
// =================================================================
adminRoutes.get(
  '/clinics/:clinicId/master-schedule',
  zValidator('query', z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  })),
  async (c) => {
    const { clinicId } = c.req.param();
    const { start_date, end_date } = c.req.valid('query');

    try {
      // 1. Fetch Clinic Overrides
      const clinicOverridesPromise = db.query.clinicOverrides.findMany({
        where: and(
          eq(clinicOverrides.clinicId, clinicId),
          gte(clinicOverrides.endDateTime, start_date),
          lt(clinicOverrides.startDateTime, end_date)
        )
      });

      // 2. Fetch all doctors associated with the clinic
      const doctorsInClinic = await db.query.doctorClinics.findMany({
          where: eq(doctorClinics.clinicId, clinicId),
          columns: {
              doctorId: true
          }
      });

      const doctorIds = doctorsInClinic.map(dc => dc.doctorId);

      if (doctorIds.length === 0) {
        // No doctors in the clinic, just return clinic-level events
        const clinic_overrides = await clinicOverridesPromise;
        return c.json({
          clinic_overrides,
          doctor_schedules: [],
          doctor_overrides: [],
          booked_appointments: [],
        });
      }
      
      // 3. Fetch Doctor Schedules (for all doctors in the clinic)
      const doctorSchedulesPromise = db.query.doctorSchedules.findMany({
        where: inArray(doctorSchedules.doctorId, doctorIds)
      });

      // 4. Fetch Doctor Overrides (for all doctors in the clinic)
      const doctorOverridesPromise = db.query.doctorAvailabilityOverrides.findMany({
        where: and(
          inArray(doctorAvailabilityOverrides.doctorId, doctorIds),
          gte(doctorAvailabilityOverrides.endDateTime, start_date),
          lt(doctorAvailabilityOverrides.startDateTime, end_date)
        )
      });

      // 5. Fetch Booked Appointments (for all doctors in the clinic)
      const bookedAppointmentsPromise = db.query.appointments.findMany({
        where: and(
          eq(appointments.clinicId, clinicId),
          inArray(appointments.doctorId, doctorIds),
          gte(appointments.appointmentTime, start_date),
          lt(appointments.appointmentTime, end_date),
          eq(appointments.status, 'scheduled')
        ),
        with: {
            patient: { columns: { firstName: true, lastName: true } },
            doctor: { columns: { fullName: true } },
            service: { columns: { name: true, durationMinutes: true } }
        }
      });
      
      // Await all promises
      const [
        clinic_overrides, 
        doctor_schedules, 
        doctor_overrides, 
        booked_appointments
      ] = await Promise.all([
        clinicOverridesPromise,
        doctorSchedulesPromise,
        doctorOverridesPromise,
        bookedAppointmentsPromise
      ]);

      return c.json({
        clinic_overrides,
        doctor_schedules,
        doctor_overrides,
        booked_appointments,
      });

    } catch (error) {
      console.error("Failed to fetch master schedule:", error);
      return c.json({ error: "Failed to fetch master schedule data" }, 500);
    }
  }
);

// This is the new endpoint to fetch all data needed for the clinic management page
adminRoutes.get('/clinics/:id/management-context', async (c) => {
    const { id } = c.req.param();

    try {
        const clinicQuery = db.query.clinics.findFirst({
            where: eq(clinics.id, id),
            with: {
                services: { with: { service: true } },
                doctors: { with: { doctor: true } },
                doctorClinicServices: true, // Fetch the join table records
            }
        });

        const allServicesQuery = db.query.services.findMany({
            orderBy: [asc(services.name)]
        });
        const allDoctorsQuery = db.query.doctors.findMany({
            orderBy: [asc(doctors.fullName)]
        });

        const [clinic, allServices, allDoctors] = await Promise.all([
            clinicQuery,
            allServicesQuery,
            allDoctorsQuery,
        ]);

        if (!clinic) {
            return c.json({ error: 'Clinic not found' }, 404);
        }

        return c.json({
            clinic,
            allServices,
            allDoctors,
        });

    } catch (error: any) {
        console.error(`Failed to get management context for clinic ${id}:`, error);
        return c.json({ error: 'Internal Server Error', message: error.message }, 500);
    }
});

const getDoctorsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().optional(),
  clinic_id: z.string().optional(), // Keep existing clinic filtering
});

adminRoutes.get('/doctors', zValidator('query', getDoctorsSchema), async (c) => {
    try {
      const { page, limit, q, clinic_id } = c.req.valid('query');
      const offset = (page - 1) * limit;

      const whereClause = q 
        ? or(
            ilike(doctors.fullName, `%${q}%`),
            ilike(doctors.specialtyText, `%${q}%`)
          )
        : undefined;

      let doctorsQuery = db.select({
        ...getTableColumns(doctors),
        doctorClinics: sql<any>`COALESCE(
          json_agg(
            json_build_object('clinicId', ${doctorClinics.clinicId})
          ) FILTER (WHERE ${doctorClinics.clinicId} IS NOT NULL),
          '[]'
        )`.as('doctorClinics')
      })
      .from(doctors)
      .leftJoin(doctorClinics, eq(doctors.id, doctorClinics.doctorId))
      .where(whereClause)
      .groupBy(doctors.id)
      .orderBy(asc(doctors.fullName))
      .limit(limit)
      .offset(offset);

      let totalCountQuery = db.select({ count: count() })
        .from(doctors)
        .where(whereClause);

      const [allDoctors, totalResult] = await Promise.all([
        doctorsQuery,
        totalCountQuery
      ]);

      let finalDoctors = allDoctors;
      let totalCount = totalResult[0]?.count ?? 0;

      // Apply clinic filtering if specified (post-query for simplicity)
      if (clinic_id) {
        finalDoctors = allDoctors.filter(d => 
          Array.isArray(d.doctorClinics) && 
          d.doctorClinics.some((dc: any) => dc.clinicId === clinic_id)
        );
        totalCount = finalDoctors.length; // Approximate count for filtered results
      }

      return c.json({
        data: finalDoctors,
        pagination: {
          page,
          pageSize: limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      return c.json({ error: 'Failed to fetch doctors', message: error.message }, 500);
    }
  });

// START: UPDATE DOCTOR-SERVICE ASSIGNMENTS
adminRoutes.put('/clinics/:clinicId/doctor-assignments',
    zValidator('json', z.object({
        assignments: z.array(z.object({
            serviceId: z.string().uuid(),
            doctorIds: z.array(z.string().uuid()),
        }))
    })),
    async (c) => {
        const { clinicId } = c.req.param();
        const { assignments } = c.req.valid('json');

        try {
            await db.transaction(async (tx) => {
                // 1. Delete all existing assignments for this clinic's services
                const serviceIdsForClinic = assignments.map(a => a.serviceId);
                if (serviceIdsForClinic.length > 0) {
                    await tx.delete(doctorClinicServices).where(and(
                        eq(doctorClinicServices.clinicId, clinicId),
                        inArray(doctorClinicServices.serviceId, serviceIdsForClinic)
                    ));
                }

                // 2. Insert the new assignments
                const newAssignments = assignments.flatMap(a => 
                    a.doctorIds.map(doctorId => ({
                        id: uuidv4(),
                        clinicId,
                        doctorId,
                        serviceId: a.serviceId,
                    }))
                );

                if (newAssignments.length > 0) {
                    await tx.insert(doctorClinicServices).values(newAssignments);
                }
            });

            return c.json({ success: true, message: 'Assignments updated successfully.' });
        } catch (error: any) {
            console.error(`Failed to update assignments for clinic ${clinicId}:`, error);
            return c.json({ error: 'Failed to update assignments', details: error.message }, 500);
        }
    }
);
// END: UPDATE DOCTOR-SERVICE ASSIGNMENTS

// === USER MANAGEMENT ENDPOINTS ===

// Zod schema for admin user queries
const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  q: z.string().optional(),
  role: z.enum(['admin', 'patient', 'manager']).optional(),
});

// GET /admin/users - List all users with pagination and filtering
adminRoutes.get('/users', zValidator('query', adminUsersQuerySchema), async (c) => {
    console.log('[ADMIN USERS] Endpoint called - starting user fetch');
    try {
        const { page, limit, q, role } = c.req.valid('query');
        console.log('[ADMIN USERS] Query params:', { page, limit, q, role });

        // Initialize Supabase admin client for user management
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Get users from Supabase Auth with pagination
        const { data: usersResponse, error } = await supabaseAdmin.auth.admin.listUsers({
            page: page,
            perPage: limit,
        });

        if (error) {
            console.error('Failed to fetch users from Supabase:', error);
            return c.json({ error: 'Failed to fetch users', message: error.message }, 500);
        }

        let filteredUsers = usersResponse?.users || [];

        // Filter by role if specified (from Supabase Auth app_metadata)
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.app_metadata?.role === role);
        }

        // Get user IDs to fetch profile data
        const userIds = filteredUsers.map(user => user.id);

        // Fetch profile data from database for these users
        let userProfiles: any[] = [];
        if (userIds.length > 0) {
            try {
                console.log(`[ADMIN] Fetching profiles for ${userIds.length} users:`, userIds);
                userProfiles = await db
                    .select()
                    .from(profiles)
                    .where(inArray(profiles.id, userIds))
                    .orderBy(asc(profiles.firstName), asc(profiles.lastName));
                console.log(`[ADMIN] Found ${userProfiles.length} profiles:`, userProfiles.map(p => ({ 
                    id: p.id, 
                    firstName: p.firstName, 
                    lastName: p.lastName, 
                    email: p.email 
                })));
            } catch (dbError) {
                console.log('Error fetching user profiles:', dbError);
                // Continue without profile data if database query fails
                userProfiles = [];
            }
        }

        // Create a map for quick profile lookup
        const profileMap = new Map(userProfiles.map(profile => [profile.id, profile]));

        // Transform users to match frontend expectations
        const transformedUsers = filteredUsers.map(user => {
            const profile = profileMap.get(user.id);
            
            // Construct full name from first_name and last_name
            let fullName = null;
            if (profile?.firstName || profile?.lastName) {
                const firstName = profile?.firstName || '';
                const lastName = profile?.lastName || '';
                fullName = `${firstName} ${lastName}`.trim() || null;
            }

            const transformedUser = {
                id: user.id,
                email: user.email,
                role: user.app_metadata?.role || profile?.role || 'patient',
                fullName: fullName,
                createdAt: user.created_at,
                lastSignIn: user.last_sign_in_at,
                emailConfirmed: !!user.email_confirmed_at,
            };

            // Debug log for the first few users
            if (filteredUsers.indexOf(user) < 3) {
                console.log(`[ADMIN] User ${user.id} transformed:`, {
                    email: user.email,
                    profileFound: !!profile,
                    profileFirstName: profile?.firstName,
                    profileLastName: profile?.lastName,
                    constructedFullName: fullName,
                    role: transformedUser.role
                });
            }

            return transformedUser;
        });

        // Apply search filter after transformation (so we can search full names)
        let finalUsers = transformedUsers;
        if (q) {
            const searchTerm = q.toLowerCase();
            finalUsers = transformedUsers.filter(user => 
                user.email?.toLowerCase().includes(searchTerm) ||
                user.fullName?.toLowerCase().includes(searchTerm)
            );
        }

        // Return paginated response
        const response = {
            data: finalUsers,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(filteredUsers.length / limit),
                totalCount: filteredUsers.length,
                hasNextPage: page < Math.ceil(filteredUsers.length / limit),
                hasPreviousPage: page > 1,
            },
        };

        console.log('[ADMIN USERS] Returning response with', finalUsers.length, 'users');
        console.log('[ADMIN USERS] Sample user:', finalUsers[0] ? {
            id: finalUsers[0].id,
            email: finalUsers[0].email,
            fullName: finalUsers[0].fullName,
            role: finalUsers[0].role
        } : 'No users found');

        return c.json(response);

    } catch (error: any) {
        console.error('Error fetching admin users:', error);
        return c.json({ error: 'Failed to fetch users', message: error.message }, 500);
    }
});

// PUT /admin/users/:userId/role - Update user role
adminRoutes.put('/users/:userId/role', 
    zValidator('json', z.object({
        role: z.enum(['admin', 'patient', 'manager'])
    })),
    async (c) => {
        try {
            const { userId } = c.req.param();
            const { role } = c.req.valid('json');

            // Initialize Supabase admin client
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            // Update user role in both Supabase Auth and database profiles table
            await db.transaction(async (tx) => {
                // 1. Update role in Supabase Auth (for authentication/authorization)
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                    app_metadata: { role }
                });

                if (authError) {
                    console.error('Failed to update user role in Supabase Auth:', authError);
                    throw new Error(`Failed to update auth role: ${authError.message}`);
                }

                // 2. Update role in database profiles table (for application logic)
                try {
                    await tx
                        .update(profiles)
                        .set({ 
                            role: role as any, // Cast to satisfy TypeScript
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(profiles.id, userId));
                } catch (dbError) {
                    console.error('Failed to update user role in database:', dbError);
                    throw new Error(`Failed to update database role: ${dbError}`);
                }

                return authData;
            });

            return c.json({ 
                success: true, 
                message: 'User role updated successfully in both auth and database',
                user: {
                    id: userId,
                    role: role
                }
            });

        } catch (error: any) {
            console.error('Error updating user role:', error);
            return c.json({ error: 'Failed to update user role', message: error.message }, 500);
        }
    }
);

export default adminRoutes;
