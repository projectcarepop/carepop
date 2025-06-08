import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SupplierAdminService } from '../../services/admin/supplier.admin.service';
import { createSupplierSchema, updateSupplierSchema } from '../../validation/admin/supplier.admin.validation';

export class SupplierAdminController {
  constructor(private supplierService: SupplierAdminService) {}

  async getAllSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await this.supplierService.getAllSuppliers();
      res.status(StatusCodes.OK).json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplier = await this.supplierService.getSupplierById(id);
      if (!supplier) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Supplier not found' });
      }
      res.status(StatusCodes.OK).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedBody = createSupplierSchema.parse(req.body);
      const newSupplier = await this.supplierService.createSupplier(validatedBody);
      res.status(StatusCodes.CREATED).json({ success: true, data: newSupplier });
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedBody = updateSupplierSchema.parse(req.body);
      const updatedSupplier = await this.supplierService.updateSupplier(id, validatedBody);
      res.status(StatusCodes.OK).json({ success: true, data: updatedSupplier });
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.supplierService.deleteSupplier(id);
      res.status(StatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
} 