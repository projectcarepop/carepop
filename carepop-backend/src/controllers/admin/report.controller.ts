import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/authenticated-request.interface';
import * as reportService from '@/services/admin/report.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendCreated, sendSuccess } from '@/utils/responseHandler';

const createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentId } = req.params;
  const { reportContent } = req.body;
  const adminId = req.user!.id;

  const report = await reportService.createReport(appointmentId, adminId, reportContent);
  sendCreated(res, { message: 'Report created successfully.', data: report });
});

const getReportsForAppointment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentId } = req.params;
  const reports = await reportService.getReportsForAppointment(appointmentId);
  sendSuccess(res, { message: 'Reports retrieved successfully.', data: reports });
});

const updateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;
  const { reportContent } = req.body;
  const updatedReport = await reportService.updateReport(reportId, reportContent);
  sendSuccess(res, { message: 'Report updated successfully.', data: updatedReport });
});

export { createReport, getReportsForAppointment, updateReport }; 