import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { ReportAdminService } from '../../services/admin/report.admin.service';
import { 
  createReportBodySchema, 
  getReportsParamsSchema, 
  updateReportParamsSchema,
  updateReportBodySchema
} from '../../validation/admin/report.admin.validation';
import { StatusCodes } from 'http-status-codes';

export class ReportAdminController {
  constructor(private reportAdminService: ReportAdminService) {}

  async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = getReportsParamsSchema.parse(req.params);
      const { reportContent } = createReportBodySchema.parse(req.body);
      const adminId = req.user!.id;
      
      const result = await this.reportAdminService.createReport(appointmentId, adminId, reportContent);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getReportsForAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = getReportsParamsSchema.parse(req.params);
      const result = await this.reportAdminService.getReportsForAppointment(appointmentId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reportId } = updateReportParamsSchema.parse(req.params);
      const { reportContent } = updateReportBodySchema.parse(req.body);

      const result = await this.reportAdminService.updateReport(reportId, reportContent);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
} 