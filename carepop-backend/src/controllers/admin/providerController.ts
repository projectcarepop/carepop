import { Request, Response } from 'express';
import { providerService } from '../../services/admin/providerService';
import { createProviderSchema, updateProviderSchema } from '../../validation/admin/providerValidation';
import { commonSchemas } from '../../validation/commonSchemas';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/responseHandler';

export const providerController = {
  createProvider: async (req: Request, res: Response) => {
    const providerData = createProviderSchema.parse(req.body);
    const newProvider = await providerService.create(providerData);
    sendCreated(res, newProvider);
  },

  getAllProviders: async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const providers = await providerService.getAll(searchQuery);
    sendSuccess(res, providers);
  },

  getProviderById: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const provider = await providerService.getById(id);
    sendSuccess(res, provider);
  },

  updateProvider: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const providerData = updateProviderSchema.parse(req.body);
    const updatedProvider = await providerService.update(id, providerData);
    sendSuccess(res, updatedProvider);
  },

  deleteProvider: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await providerService.delete(id);
    sendNoContent(res);
  },
}; 