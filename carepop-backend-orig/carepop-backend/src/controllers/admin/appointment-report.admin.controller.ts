import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppointmentReportAdminService } from '../../services/admin/appointment-report.admin.service';
import { AuthenticatedRequest } from '../../types/authenticated-request.interface';
import { 
  createAppointmentReportSchema, 
  updateAppointmentReportSchema 
} from '../../validation/admin/appointment-report.admin.validation';

export class AppointmentReportAdminController {
  constructor(private reportService: AppointmentReportAdminService) {}

  async getReportForAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const report = await this.reportService.getReportByAppointmentId(appointmentId);
      if (report) {
        res.status(StatusCodes.OK).json({ success: true, data: report });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Report not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportData = createAppointmentReportSchema.parse(req.body);
      const newReport = await this.reportService.createAppointmentReport(reportData);
      res.status(StatusCodes.CREATED).json({ success: true, data: newReport });
    } catch (error) {
      next(error);
    }
  }

  async updateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reportId } = req.params;
      const reportData = updateAppointmentReportSchema.parse(req.body);
      const updatedReport = await this.reportService.updateAppointmentReport(reportId, reportData);
      res.status(StatusCodes.OK).json({ success: true, data: updatedReport });
    } catch (error) {
      next(error);
    }
  }
} 