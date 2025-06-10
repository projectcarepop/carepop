import { Router } from 'express';
import { appointmentController } from '../../controllers/admin/appointmentController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authMiddleware);
router.use(authorize(['admin', 'clinic_manager'])); // Allow admins or clinic managers to view/edit

router
  .route('/')
  .get(asyncHandler(appointmentController.getAllAppointments));

router
  .route('/:id')
  .get(asyncHandler(appointmentController.getAppointmentById))
  .patch(asyncHandler(appointmentController.updateAppointment));

export default router; 