import { Router } from 'express';
import { ProfileAdminController } from '../../controllers/admin/profile.admin.controller';
import { ProfileAdminService } from '../../services/admin/profile.admin.service';
import { authenticateToken } from 'middleware/authMiddleware';
import { isAdmin } from 'middleware/role.middleware';

const router = Router();
const profileAdminService = new ProfileAdminService();
const profileAdminController = new ProfileAdminController(profileAdminService);

router.get(
  '/',
  authenticateToken,
  isAdmin,
  profileAdminController.getAllProfiles.bind(profileAdminController)
);

export default router; 