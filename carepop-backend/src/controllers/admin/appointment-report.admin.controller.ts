import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppointmentReportAdminService } from '../../services/admin/appointment-report.admin.service';
import { AuthenticatedRequest } from '../../types/authenticated-request.interface';

export class AppointmentReportAdminController {
  constructor(private reportService: AppointmentReportAdminService) {}

  async getReportForAppointment(req: Request, res: Response): Promise<void> {
    const { appointmentId } = req.params;
    const report = await this.reportService.getReportByAppointmentId(appointmentId);
    if (report) {
      res.status(StatusCodes.OK).json(report);
    } else {
      res.status(StatusCodes.OK).json(null); // Return null if no report exists
    }
  }

  async createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const reportData = req.body;
    const newReport = await this.reportService.createAppointmentReport(reportData);
    res.status(StatusCodes.CREATED).json(newReport);
  }

  async updateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { reportId } = req.params;
    const reportData = req.body;
    const updatedReport = await this.reportService.updateAppointmentReport(reportId, reportData);
    res.status(StatusCodes.OK).json(updatedReport);
  }
} 