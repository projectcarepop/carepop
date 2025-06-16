import { Router } from 'express';
import { getMyMedicalRecords, getMedicalRecordSignedUrl } from '@/controllers/public/medicalRecord.public.controller';
import { authMiddleware } from '@/lib/middleware/auth.middleware';

const router = Router();

// All routes in this file require authentication
router.use(authMiddleware);

// Route to get all medical records for the authenticated user
router.get('/my', getMyMedicalRecords);

// Route to get a signed URL for a specific medical record
router.get('/my/:recordId/signed-url', getMedicalRecordSignedUrl);

export default router; 