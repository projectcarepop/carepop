import { db } from '../../db/drizzle';
import { clinics } from '../../db/schema';
import { ApiError } from '../../lib/errors';
import { CreateClinicInput, UpdateClinicInput } from './clinics.validation';
import { eq } from 'drizzle-orm';
// We'll need this later for create/update
// import { type CreateClinicInput, type UpdateClinicInput } from './clinics.validation';

async function getAllClinics() {
  try {
    const data = await db.query.clinics.findMany({
      orderBy: (clinics, { desc }) => [desc(clinics.createdAt)],
    });
    return data;
  } catch (error) {
    console.error('Error fetching clinics:', error);
    // It's better to cast to Error to get a message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve clinics. Database error: ${errorMessage}`);
  }
}

async function getAllClinicsForAdmin() {
  try {
    const data = await db.query.clinics.findMany({
      orderBy: (clinics, { asc }) => [asc(clinics.name)],
    });
    return data;
  } catch (error) {
    console.error('Error fetching clinics for admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve clinics. Database error: ${errorMessage}`);
  }
}

async function getClinicById(id: string) {
  try {
    const data = await db.query.clinics.findFirst({
      where: (clinics, { eq }) => eq(clinics.id, id),
    });
    if (!data) {
      throw new ApiError(404, 'Clinic not found');
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`Error fetching clinic by ID ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve clinic. Database error: ${errorMessage}`);
  }
}

async function createClinic(data: CreateClinicInput) {
  try {
    const [newClinic] = await db.insert(clinics).values(data).returning();
    return newClinic;
  } catch (error) {
    console.error('Error creating clinic:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not create clinic. Database error: ${errorMessage}`);
  }
}

async function updateClinic(id: string, data: UpdateClinicInput) {
  try {
    const [updatedClinic] = await db
      .update(clinics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinics.id, id))
      .returning();
    if (!updatedClinic) {
      throw new ApiError(404, 'Clinic not found to update');
    }
    return updatedClinic;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`Error updating clinic ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not update clinic. Database error: ${errorMessage}`);
  }
}

async function deleteClinic(id: string) {
  try {
    const [deletedClinic] = await db.delete(clinics).where(eq(clinics.id, id)).returning();
     if (!deletedClinic) {
      throw new ApiError(404, 'Clinic not found to delete');
    }
    return { success: true, id: deletedClinic.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`Error deleting clinic ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not delete clinic. Database error: ${errorMessage}`);
  }
}


export const clinicsService = {
  getAllClinics,
  getAllClinicsForAdmin,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
}; 