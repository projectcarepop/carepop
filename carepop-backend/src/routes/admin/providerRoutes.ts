import { Router } from 'express';
import { providerController } from '../../controllers/admin/providerController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router
  .route('/')
  .post(asyncHandler(providerController.createProvider))
  .get(asyncHandler(providerController.getAllProviders));

router
  .route('/:id')
  .get(asyncHandler(providerController.getProviderById))
  .patch(asyncHandler(providerController.updateProvider))
  .delete(asyncHandler(providerController.deleteProvider));

export default router; 