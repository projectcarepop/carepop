import { db } from '../../db/drizzle';
import { ApiError } from '../../lib/errors';
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

// Placeholder for future functions
async function getClinicById(id: string) {
    // TODO
}
async function createClinic() {
    // TODO
}
async function updateClinic() {
    // TODO
}
async function deleteClinic() {
    // TODO
}


export const clinicsService = {
  getAllClinics,
  // getClinicById,
  // createClinic,
  // updateClinic,
  // deleteClinic,
}; 