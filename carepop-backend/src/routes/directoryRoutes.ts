import express from 'express';
import {
  searchClinics,
  getClinicById,
} from '../controllers/directoryController'; // Assuming controller will be created here

const router = express.Router();

// GET /api/v1/directory/clinics/search
router.get('/clinics/search', searchClinics);

// GET /api/v1/directory/clinics/:clinicId
router.get('/clinics/:clinicId', getClinicById);

export default router; 