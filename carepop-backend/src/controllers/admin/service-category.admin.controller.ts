import { Request, Response, NextFunction } from 'express';
import { ServiceCategoryAdminService } from '../../services/admin/service-category.admin.service';
import { createServiceCategorySchema, updateServiceCategorySchema } from '../../validation/admin/service-category.admin.validation';

export class ServiceCategoryAdminController {
  constructor(private serviceCategoryAdminService: ServiceCategoryAdminService) {
    this.getAllServiceCategories = this.getAllServiceCategories.bind(this);
    this.getServiceCategoryById = this.getServiceCategoryById.bind(this);
    this.createServiceCategory = this.createServiceCategory.bind(this);
    this.updateServiceCategory = this.updateServiceCategory.bind(this);
    this.deleteServiceCategory = this.deleteServiceCategory.bind(this);
  }

  async getAllServiceCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.serviceCategoryAdminService.getAllServiceCategories();
      res.status(200).json({
        message: 'Service categories retrieved successfully.',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.serviceCategoryAdminService.getServiceCategoryById(id);
      res.status(200).json({
        message: 'Service category retrieved successfully.',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async createServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createServiceCategorySchema.parse(req.body);
      const newCategory = await this.serviceCategoryAdminService.createServiceCategory(validatedData);
      res.status(201).json({
        message: 'Service category created successfully.',
        data: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateServiceCategorySchema.parse(req.body);
      const updatedCategory = await this.serviceCategoryAdminService.updateServiceCategory(id, validatedData);
      res.status(200).json({
        message: 'Service category updated successfully.',
        data: updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.serviceCategoryAdminService.deleteServiceCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 