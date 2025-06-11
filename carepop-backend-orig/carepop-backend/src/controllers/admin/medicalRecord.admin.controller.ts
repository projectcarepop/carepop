import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { MedicalRecordAdminService } from '../../services/admin/medicalRecord.admin.service';
import { 
  createRecordBodySchema,
  getRecordsParamsSchema,
  recordIdParamsSchema,
  updateRecordBodySchema
} from '../../validation/admin/medicalRecord.admin.validation';
import { StatusCodes } from 'http-status-codes';

export class MedicalRecordAdminController {
  constructor(private medicalRecordAdminService: MedicalRecordAdminService) {}

  async createRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('--- CREATE MEDICAL RECORD ---');
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      console.log('Request File:', req.file);
      
      const { userId } = getRecordsParamsSchema.parse(req.params);
      
      // Manually and safely extract fields from the multipart form body
      const recordTitle = req.body?.recordTitle;
      const recordDetails = req.body?.recordDetails;

      if (!recordTitle || typeof recordTitle !== 'string') {
        return res.status(400).json({ message: 'Record title is required.' });
      }

      const adminId = req.user!.id;
      const file = req.file;
      
      const result = await this.medicalRecordAdminService.createRecord(userId, adminId, recordTitle, recordDetails, file);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecordsForUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = getRecordsParamsSchema.parse(req.params);
      const result = await this.medicalRecordAdminService.getRecordsForUser(userId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { recordId } = recordIdParamsSchema.parse(req.params);
      const { recordTitle, recordDetails } = updateRecordBodySchema.parse(req.body);

      const result = await this.medicalRecordAdminService.updateRecord(recordId, recordTitle, recordDetails);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { recordId } = recordIdParamsSchema.parse(req.params);
      const result = await this.medicalRecordAdminService.deleteRecord(recordId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
} 