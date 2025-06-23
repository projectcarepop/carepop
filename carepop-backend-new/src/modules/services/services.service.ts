import { db } from '../../db/drizzle';
import { services, serviceCategories } from '../../db/schema';
import { ApiError } from '../../lib/errors';
import { CreateServiceInput, UpdateServiceInput } from './services.validation';
import { eq, asc } from 'drizzle-orm';

async function getAllServicesForAdmin() {
  try {
    const data = await db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
        durationMinutes: services.durationMinutes,
        isActive: services.isActive,
        createdAt: services.createdAt,
        serviceCategory: {
          id: serviceCategories.id,
          name: serviceCategories.name,
        },
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.serviceCategoryId, serviceCategories.id))
      .orderBy(asc(services.name));
      
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve services. Database error: ${errorMessage}`);
  }
}

async function getServiceById(id: string) {
  try {
    const data = await db.query.services.findFirst({
      where: (services, { eq }) => eq(services.id, id),
    });
    if (!data) {
      throw new ApiError(404, 'Service not found');
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve service. Database error: ${errorMessage}`);
  }
}

async function createService(data: CreateServiceInput) {
  try {
    const [newService] = await db.insert(services).values(data).returning();
    return newService;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not create service. Database error: ${errorMessage}`);
  }
}

async function updateService(id: string, data: UpdateServiceInput) {
  try {
    const [updatedService] = await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    if (!updatedService) {
      throw new ApiError(404, 'Service not found to update');
    }
    return updatedService;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not update service. Database error: ${errorMessage}`);
  }
}

async function deleteService(id: string) {
  try {
    const [deletedService] = await db.delete(services).where(eq(services.id, id)).returning();
     if (!deletedService) {
      throw new ApiError(404, 'Service not found to delete');
    }
    return { success: true, id: deletedService.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not delete service. Database error: ${errorMessage}`);
  }
}

export const servicesService = {
  getAllServicesForAdmin,
  getServiceById,
  createService,
  updateService,
  deleteService,
}; 