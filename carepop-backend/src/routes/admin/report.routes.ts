import { Router } from 'express';
import * as reportController from '@/controllers/admin/report.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createReportSchema,
  getReportsSchema,
  updateReportSchema,
} from '@/validation/admin/report.validation';

const router = Router();

// Route to get all reports for a specific appointment and create a new one
router
  .route('/appointment/:appointmentId')
  .get(validateRequest({ params: getReportsSchema.shape.params }), reportController.getReportsForAppointment)
  .post(
    validateRequest({
      params: createReportSchema.shape.params,
      body: createReportSchema.shape.body,
    }),
    reportController.createReport
  );

// Route to update a specific report by its ID
router
  .route('/:reportId')
  .put(
    validateRequest({
      params: updateReportSchema.shape.params,
      body: updateReportSchema.shape.body,
    }),
    reportController.updateReport
  );

export default router; 