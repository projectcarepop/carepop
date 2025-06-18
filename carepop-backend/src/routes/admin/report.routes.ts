import { Router } from 'express';
import * as reportController from '@/controllers/admin/appointment-report.admin.controller';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { authorize } from '@/lib/middleware/role.middleware';

const router = Router();
const adminOnly = authorize(['admin']);

// This matches the POST /api/v1/admin/reports from the frontend
router.post(
    '/',
    authMiddleware,
    adminOnly,
    reportController.createOrUpdateReport
);

export default router; 