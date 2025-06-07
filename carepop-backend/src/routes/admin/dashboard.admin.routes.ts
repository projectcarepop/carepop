import { Router } from 'express';
import * as dashboardController from '../../controllers/admin/dashboard.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();

// GET /api/v1/admin/stats - Get dashboard statistics
router.get(
  '/stats',
  authenticateToken,
  isAdmin,
  dashboardController.getStats
);

// POST /api/v1/admin/users/:userId/grant-admin - Grant admin role to a user
router.post(
  '/users/:userId/grant-admin',
  authenticateToken,
  isAdmin,
  dashboardController.grantAdmin
);

export default router; 