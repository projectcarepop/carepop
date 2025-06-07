import { Request, Response, NextFunction } from 'express';
import { ServiceAdminService } from '../../services/admin/service.admin.service';

export class ServiceAdminController {
  constructor(private serviceAdminService: ServiceAdminService) {
    this.getAllServices = this.getAllServices.bind(this);
  }

  async getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await this.serviceAdminService.getAllServices();
      res.status(200).json({
        message: 'Services retrieved successfully.',
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }
} 