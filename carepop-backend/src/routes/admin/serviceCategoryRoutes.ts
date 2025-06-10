import { Router } from 'express';
import { serviceCategoryController } from '../../controllers/admin/serviceCategoryController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router
  .route('/')
  .post(asyncHandler(serviceCategoryController.createCategory))
  .get(asyncHandler(serviceCategoryController.getAllCategories));

router
  .route('/:id')
  .get(asyncHandler(serviceCategoryController.getCategoryById))
  .patch(asyncHandler(serviceCategoryController.updateCategory))
  .delete(asyncHandler(serviceCategoryController.deleteCategory));

export default router; 