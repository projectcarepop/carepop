import { Router } from 'express';
import { userController } from '../../controllers/admin/userController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser);

router.get('/:userId/appointments', userController.getUserAppointments);
router.get('/:userId/medical-records', userController.getUserMedicalRecords);

export default router; 