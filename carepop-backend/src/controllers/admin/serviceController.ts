import { Request, Response } from 'express';
import { serviceService } from 'services/admin/serviceService';
import { serviceSchemas } from 'validation/admin/serviceSchemas';
import { commonSchemas } from 'validation/commonSchemas';
import { sendSuccess, sendCreated, sendNoContent } from 'utils/responseHandlers';
import { tryCatch } from 'utils/tryCatch';

export const serviceController = {
  createService: async (req: Request, res: Response) => {
    const serviceData = serviceSchemas.createServiceSchema.parse(req.body);
    const newService = await serviceService.create(serviceData);
    sendCreated(res, newService);
  },

  getAllServices: tryCatch(async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const services = await serviceService.getAll(searchQuery);
    sendSuccess(res, services);
  }),

  getServiceById: tryCatch(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const service = await serviceService.getById(id);
    sendSuccess(res, service);
  }),

  updateService: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const serviceData = serviceSchemas.updateServiceSchema.parse(req.body);
    const updatedService = await serviceService.update(id, serviceData);
    sendSuccess(res, updatedService);
  },

  deleteService: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await serviceService.delete(id);
    sendNoContent(res);
  },
}; 