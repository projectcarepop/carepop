import { Router } from 'express';
import { MedicalRecordAdminController } from '../../controllers/admin/medicalRecord.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createAdminMedicalRecordRoutes = (controller: MedicalRecordAdminController): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    authenticateToken,
    isAdmin,
    upload.single('recordFile'),
    controller.createRecord.bind(controller)
  );

  router.get(
    '/',
    authenticateToken,
    isAdmin,
    controller.getRecordsForUser.bind(controller)
  );
  
  return router;
};

export const createAdminSingleMedicalRecordRoutes = (controller: MedicalRecordAdminController): Router => {
  const router = Router();

  router.put(
    '/:recordId',
    authenticateToken,
    isAdmin,
    controller.updateRecord.bind(controller)
  );

  router.delete(
    '/:recordId',
    authenticateToken,
    isAdmin,
    controller.deleteRecord.bind(controller)
  );

  return router;
}; 