import { Request, Response, NextFunction } from 'express';
import { AdminProviderService } from '../../services/admin/provider.admin.service';
import { CreateProviderBody, UpdateProviderBody, ListProvidersQuery, ProviderIdParams } from '../../validation/admin/provider.admin.validation';

export class AdminProviderController {
  private adminProviderService: AdminProviderService;

  constructor() {
    this.adminProviderService = new AdminProviderService();
  }

  createProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming validateRequest middleware populates req.body with validated CreateProviderBody
      const { body: providerData } = req as unknown as { body: CreateProviderBody }; 
      
      const newProvider = await this.adminProviderService.createProvider(providerData);
      res.status(201).json({ message: 'Provider created successfully', data: newProvider });
    } catch (error) {
      next(error);
    }
  };

  listProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming validateRequest middleware populates req.query with validated ListProvidersQuery
      const { query: queryParams } = req as unknown as { query: ListProvidersQuery };
      const result = await this.adminProviderService.listProviders(queryParams);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getProviderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming validateRequest middleware populates req.params with validated ProviderIdParams
      const { params: { providerId } } = req as unknown as { params: ProviderIdParams };
      const provider = await this.adminProviderService.getProviderById(providerId);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json({ data: provider });
    } catch (error) {
      next(error);
    }
  };

  updateProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming validateRequest middleware populates req.params and req.body
      const { params: { providerId }, body: providerData } = req as unknown as { params: ProviderIdParams, body: UpdateProviderBody };
      const updatedProvider = await this.adminProviderService.updateProvider(providerId, providerData);
      if (!updatedProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json({ message: 'Provider updated successfully', data: updatedProvider });
    } catch (error) {
      next(error);
    }
  };

  deleteProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming validateRequest middleware populates req.params
      const { params: { providerId } } = req as unknown as { params: ProviderIdParams };
      const success = await this.adminProviderService.deleteProvider(providerId);
      if (!success) {
        return res.status(404).json({ message: 'Provider not found or could not be deleted' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 