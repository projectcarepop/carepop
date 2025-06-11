import { Router } from 'express';
import * as dashboardController from '@/controllers/admin/dashboard.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import { commonSchemas } from '@/validation/commonSchemas';
import { z } from 'zod';

const router = Router();

// GET /api/v1/admin/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// POST /api/v1/admin/dashboard/users/:userId/grant-admin - Grant admin role to a user
router.post(
  '/users/:userId/grant-admin',
  validateRequest({ params: z.object({ userId: commonSchemas.uuid }) }),
  dashboardController.grantAdmin
);

export default router; 