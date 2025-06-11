import { Router } from 'express';
import {
  createServiceCategory,
  getServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  deleteServiceCategory,
} from '@/controllers/admin/service-category.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  serviceCategoryIdParamSchema,
  listServiceCategoriesQuerySchema,
} from '@/validation/admin/service-category.validation';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createServiceCategorySchema }), createServiceCategory)
  .get(validateRequest({ query: listServiceCategoriesQuerySchema }), getServiceCategories);

router.route('/:id')
  .get(validateRequest({ params: serviceCategoryIdParamSchema }), getServiceCategoryById)
  .put(validateRequest({ params: serviceCategoryIdParamSchema, body: updateServiceCategorySchema }), updateServiceCategory)
  .delete(validateRequest({ params: serviceCategoryIdParamSchema }), deleteServiceCategory);

export default router; 