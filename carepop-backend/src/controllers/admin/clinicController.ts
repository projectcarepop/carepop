import { Request, Response } from 'express';
import { clinicService } from '../../services/admin/clinicService';
import { createClinicSchema, updateClinicSchema } from '../../validation/admin/clinicValidation';
import { commonSchemas } from '../../validation/commonSchemas';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/responseHandler';

export const clinicController = {
  createClinic: async (req: Request, res: Response) => {
    const clinicData = createClinicSchema.parse(req.body);
    const newClinic = await clinicService.create(clinicData);
    sendCreated(res, newClinic);
  },

  getAllClinics: async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const clinics = await clinicService.getAll(searchQuery);
    sendSuccess(res, clinics);
  },

  getClinicById: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const clinic = await clinicService.getById(id);
    sendSuccess(res, clinic);
  },

  updateClinic: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const clinicData = updateClinicSchema.parse(req.body);
    const updatedClinic = await clinicService.update(id, clinicData);
    sendSuccess(res, updatedClinic);
  },

  deleteClinic: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await clinicService.delete(id);
    sendNoContent(res);
  },
}; 