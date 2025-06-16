import { Router } from 'express';
import multer from 'multer';
import { createMedicalRecord } from '@/controllers/admin/medicalRecord.admin.controller';

const router = Router();

// Configure multer for memory storage to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route for creating a medical record.
// The `upload.single('recordFile')` middleware processes a single file from the 'recordFile' field.
router.post(
  '/',
  upload.single('recordFile'),
  createMedicalRecord
);

export default router; 