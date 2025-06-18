import { Router } from 'express';
import * as reportController from '@/controllers/admin/appointment-report.admin.controller';

const router = Router();

// This matches the POST /api/v1/admin/reports from the frontend
// Auth is handled by the main admin router in /routes/admin/index.ts
router.post(
    '/',
    reportController.createOrUpdateReport
);

export default router; 