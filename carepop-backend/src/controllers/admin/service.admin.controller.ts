import { Request, Response, NextFunction } from 'express';
import { ServiceAdminService } from '../../services/admin/service.admin.service';
import { createServiceSchema, updateServiceSchema } from '../../validation/admin/service.admin.validation';
import { AppError } from '../../utils/errors';

export class ServiceAdminController {
  constructor(private serviceAdminService: ServiceAdminService) {
    this.getAllServices = this.getAllServices.bind(this);
    this.getServiceById = this.getServiceById.bind(this);
    this.createService = this.createService.bind(this);
    this.updateService = this.updateService.bind(this);
    this.deleteService = this.deleteService.bind(this);
  }

  async getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('======> getAllServices Controller <======');
      console.log('Request Query:', req.query);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      console.log(`Parsed Params: page=${page}, limit=${limit}, search=${search}`);

      const { data, count } = await this.serviceAdminService.getAllServices({ page, limit, search });
      
      const totalPages = Math.ceil(count / limit);
      console.log(`Response Meta: totalItems=${count}, totalPages=${totalPages}`);
      console.log('=======================================');

      res.status(200).json({
        message: 'Services retrieved successfully.',
        data,
        meta: {
          total: count,
          page,
          limit,
          totalPages: totalPages,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const service = await this.serviceAdminService.getServiceById(id);
      res.status(200).json({
        message: 'Service retrieved successfully.',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      const newService = await this.serviceAdminService.createService(validatedData);
      res.status(201).json({
        message: 'Service created successfully.',
        data: newService,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateServiceSchema.parse(req.body);
      const updatedService = await this.serviceAdminService.updateService(id, validatedData);
      res.status(200).json({
        message: 'Service updated successfully.',
        data: updatedService,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.serviceAdminService.deleteService(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 