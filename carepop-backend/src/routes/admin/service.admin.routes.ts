import { Router } from 'express';
import { ServiceAdminController } from '../../controllers/admin/service.admin.controller';
import { ServiceAdminService } from '../../services/admin/service.admin.service';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();
const serviceAdminService = new ServiceAdminService();
const serviceAdminController = new ServiceAdminController(serviceAdminService);

router.get(
  '/',
  authenticateToken,
  isAdmin,
  serviceAdminController.getAllServices.bind(serviceAdminController)
);

router.get(
  '/:id',
  authenticateToken,
  isAdmin,
  serviceAdminController.getServiceById.bind(serviceAdminController)
);

router.post(
  '/',
  authenticateToken,
  isAdmin,
  serviceAdminController.createService.bind(serviceAdminController)
);

router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  serviceAdminController.updateService.bind(serviceAdminController)
);

router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  serviceAdminController.deleteService.bind(serviceAdminController)
);

export default router; 