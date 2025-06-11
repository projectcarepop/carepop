import { Router } from 'express';
import { ReportAdminController } from '../../controllers/admin/report.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

export const createAdminReportRoutes = (controller: ReportAdminController): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    authenticateToken,
    isAdmin,
    controller.createReport.bind(controller)
  );

  router.get(
    '/',
    authenticateToken,
    isAdmin,
    controller.getReportsForAppointment.bind(controller)
  );
  
  return router;
};

export const createAdminSingleReportRoutes = (controller: ReportAdminController): Router => {
  const router = Router();

  router.put(
    '/:reportId',
    authenticateToken,
    isAdmin,
    controller.updateReport.bind(controller)
  );

  return router;
}; 