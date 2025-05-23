import express from 'express';
import {
  searchClinics,
  getClinicById,
  getAllClinics
} from '../controllers/directoryController'; // Assuming controller will be created here

const router = express.Router();

// GET /api/v1/directory/clinics
// Fetches all active clinics (less specific than search)
router.get('/clinics', getAllClinics);

// GET /api/v1/directory/clinics/search
// More specific search, potentially with query params for location, services etc.
router.get('/clinics/search', searchClinics);

// GET /api/v1/directory/clinics/:clinicId
router.get('/clinics/:clinicId', getClinicById);

export default router; 