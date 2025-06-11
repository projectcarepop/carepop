import { Router } from 'express';
import multer from 'multer';
import * as medicalRecordController from '@/controllers/admin/medical-record.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createMedicalRecordSchema,
  deleteMedicalRecordSchema,
  getMedicalRecordsSchema,
  updateMedicalRecordSchema,
} from '@/validation/admin/medical-record.validation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route to get all records for a specific user and create a new one
router
  .route('/user/:userId')
  .get(
    validateRequest({ params: getMedicalRecordsSchema.shape.params }),
    medicalRecordController.getRecordsForUser
  )
  .post(
    upload.single('recordFile'),
    validateRequest({
      params: createMedicalRecordSchema.shape.params,
      body: createMedicalRecordSchema.shape.body,
    }),
    medicalRecordController.createRecord
  );

// Route to update or delete a specific record by its ID
router
  .route('/:recordId')
  .put(
    validateRequest({
      params: updateMedicalRecordSchema.shape.params,
      body: updateMedicalRecordSchema.shape.body,
    }),
    medicalRecordController.updateRecord
  )
  .delete(
    validateRequest({ params: deleteMedicalRecordSchema.shape.params }),
    medicalRecordController.deleteRecord
  );

export default router; 