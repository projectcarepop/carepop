import { Router } from 'express';
import { ServiceCategoryAdminController } from '../../controllers/admin/service-category.admin.controller';
import { ServiceCategoryAdminService } from '../../services/admin/service-category.admin.service';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();
const serviceCategoryAdminService = new ServiceCategoryAdminService();
const serviceCategoryAdminController = new ServiceCategoryAdminController(serviceCategoryAdminService);

router.get(
  '/',
  authenticateToken,
  isAdmin,
  serviceCategoryAdminController.getAllServiceCategories.bind(serviceCategoryAdminController)
);

router.get(
  '/:id',
  authenticateToken,
  isAdmin,
  serviceCategoryAdminController.getServiceCategoryById.bind(serviceCategoryAdminController)
);

router.post(
  '/',
  authenticateToken,
  isAdmin,
  serviceCategoryAdminController.createServiceCategory.bind(serviceCategoryAdminController)
);

router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  serviceCategoryAdminController.updateServiceCategory.bind(serviceCategoryAdminController)
);

router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  serviceCategoryAdminController.deleteServiceCategory.bind(serviceCategoryAdminController)
);

export default router; 