import { Request, Response, NextFunction } from 'express';
import { AdminProviderService } from '../../services/admin/provider.admin.service';
import { 
  createProviderSchema,
  ListProvidersQuery,
  UpdateProviderBody,
  ProviderIdParam,
} from '../../validation/admin/provider.admin.validation';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

export class AdminProviderController {
  private adminProviderService: AdminProviderService;

  constructor(adminProviderService: AdminProviderService) {
    this.adminProviderService = adminProviderService;
    this.createProvider = this.createProvider.bind(this);
    this.listProviders = this.listProviders.bind(this);
    this.getProviderById = this.getProviderById.bind(this);
    this.updateProvider = this.updateProvider.bind(this);
    this.deleteProvider = this.deleteProvider.bind(this);
  }

  async createProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: providerData } = createProviderSchema.parse(req);
      const newProvider = await this.adminProviderService.createProvider(providerData);
      res.status(201).json({ message: 'Provider created successfully', data: newProvider });
    } catch (error) {
      next(error);
    }
  }

  async listProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const { query: queryParams } = req as unknown as { query: ListProvidersQuery };
      const result = await this.adminProviderService.listProviders(queryParams);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProviderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { params: { providerId } } = req as unknown as { params: ProviderIdParam };
      const provider = await this.adminProviderService.getProviderById(providerId);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json({ data: provider });
    } catch (error) {
      next(error);
    }
  }

  async updateProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { params: { providerId }, body: providerData } = req as unknown as { params: ProviderIdParam, body: UpdateProviderBody };
      const updatedProvider = await this.adminProviderService.updateProvider(providerId, providerData);
      if (!updatedProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json({ message: 'Provider updated successfully', data: updatedProvider });
    } catch (error) {
      next(error);
    }
  }

  async deleteProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { params: { providerId } } = req as unknown as { params: ProviderIdParam };
      const success = await this.adminProviderService.deleteProvider(providerId);
      if (!success) {
        return res.status(404).json({ message: 'Provider not found or could not be deleted' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 