import { Router } from 'express';
import { serviceController } from '../../controllers/admin/serviceController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router
  .route('/')
  .post(asyncHandler(serviceController.createService))
  .get(asyncHandler(serviceController.getAllServices));

router
  .route('/:id')
  .get(asyncHandler(serviceController.getServiceById))
  .patch(asyncHandler(serviceController.updateService))
  .delete(asyncHandler(serviceController.deleteService));

export default router; 