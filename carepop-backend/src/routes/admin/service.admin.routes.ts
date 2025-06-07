import { Router } from 'express';
import { ServiceAdminController } from '../../controllers/admin/service.admin.controller';
import { ServiceAdminService } from '../../services/admin/service.admin.service';
import { authenticateToken } from 'middleware/authMiddleware';
import { isAdmin } from 'middleware/role.middleware';

const router = Router();
const serviceAdminService = new ServiceAdminService();
const serviceAdminController = new ServiceAdminController(serviceAdminService);

router.get(
  '/',
  authenticateToken,
  isAdmin,
  serviceAdminController.getAllServices.bind(serviceAdminController)
);

export default router; 