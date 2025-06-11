import { Request, Response, NextFunction } from 'express';
import { ProviderServiceAdminService } from '../../services/admin/provider-service.admin.service';
import { assignServiceToProviderSchema } from '../../validation/admin/provider-service.admin.validation';

export class ProviderServiceAdminController {
  constructor(private providerServiceAdminService: ProviderServiceAdminService) {
    this.getServicesForProvider = this.getServicesForProvider.bind(this);
    this.getProvidersForService = this.getProvidersForService.bind(this);
    this.assignServiceToProvider = this.assignServiceToProvider.bind(this);
    this.unassignServiceFromProvider = this.unassignServiceFromProvider.bind(this);
  }

  async getServicesForProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { providerId } = req.params;
      const services = await this.providerServiceAdminService.getServicesForProvider(providerId);
      res.status(200).json({
        message: 'Services for provider retrieved successfully.',
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProvidersForService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      const providers = await this.providerServiceAdminService.getProvidersForService(serviceId);
      res.status(200).json({
        message: 'Providers for service retrieved successfully.',
        data: providers,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignServiceToProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { providerId } = req.params;
      const { service_id } = assignServiceToProviderSchema.parse(req.body);
      const assignment = await this.providerServiceAdminService.assignServiceToProvider(providerId, service_id);
      res.status(201).json({
        message: 'Service assigned to provider successfully.',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  async unassignServiceFromProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { providerId, serviceId } = req.params;
      await this.providerServiceAdminService.unassignServiceFromProvider(providerId, serviceId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 