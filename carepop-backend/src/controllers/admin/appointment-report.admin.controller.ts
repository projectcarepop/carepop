import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppointmentReportAdminService } from '../../services/admin/appointment-report.admin.service';
import { AuthenticatedRequest } from '../../types/authenticated-request.interface';
import { 
  createAppointmentReportSchema, 
  updateAppointmentReportSchema 
} from '../../validation/admin/appointment-report.admin.validation';
import { asyncHandler } from '../../utils/asyncHandler';

export class AppointmentReportAdminController {
  constructor(private reportService: AppointmentReportAdminService) {}

  getReportForAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { appointmentId } = req.params;
    const report = await this.reportService.getReportByAppointmentId(appointmentId);
    if (report) {
      res.status(StatusCodes.OK).json({ success: true, data: report });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Report not found' });
    }
  });

  createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reportData = createAppointmentReportSchema.parse(req.body);
    const newReport = await this.reportService.createAppointmentReport(reportData);
    res.status(StatusCodes.CREATED).json({ success: true, data: newReport });
  });

  updateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { reportId } = req.params;
    const reportData = updateAppointmentReportSchema.parse(req.body);
    const updatedReport = await this.reportService.updateAppointmentReport(reportId, reportData);
    res.status(StatusCodes.OK).json({ success: true, data: updatedReport });
  });
} 