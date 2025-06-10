import { Router } from 'express';
import { clinicController } from '../../controllers/admin/clinicController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

// All clinic routes require at least admin privileges
router.use(authMiddleware);
router.use(authorize(['admin', 'clinic_manager']));

router
  .route('/')
  .post(asyncHandler(clinicController.createClinic))
  .get(asyncHandler(clinicController.getAllClinics));

router
  .route('/:id')
  .get(asyncHandler(clinicController.getClinicById))
  .patch(asyncHandler(clinicController.updateClinic))
  .delete(asyncHandler(clinicController.deleteClinic));

export default router; 