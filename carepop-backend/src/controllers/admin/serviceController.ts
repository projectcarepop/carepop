import { Request, Response } from 'express';
import { serviceService } from '@/services/admin/serviceService';
import { createServiceSchema, updateServiceSchema } from '@/validation/admin/service.admin.validation';
import { commonSchemas } from '@/validation/commonSchemas';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/responseHandler';
import { asyncHandler } from '@/utils/asyncHandler';

export const serviceController = {
  createService: asyncHandler(async (req: Request, res: Response) => {
    const newService = await serviceService.create(createServiceSchema.parse(req.body));
    sendCreated(res, newService);
  }),

  getAllServices: asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const services = await serviceService.getAll(search);
    sendSuccess(res, services);
  }),

  getServiceById: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const service = await serviceService.getById(id);
    sendSuccess(res, service);
  }),

  updateService: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const updatedService = await serviceService.update(id, updateServiceSchema.parse(req.body));
    sendSuccess(res, updatedService);
  }),

  deleteService: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await serviceService.delete(id);
    sendNoContent(res);
  }),
}; 