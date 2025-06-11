import { Request, Response } from 'express';
import { createSupplierSchema } from '@/validation/admin/supplier.admin.validation';
import { supplierService } from '@/services/admin/supplierService';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendCreated, sendSuccess } from '@/utils/responseHandler';

export const supplierController = {
  createSupplier: asyncHandler(async (req: Request, res: Response) => {
    const newSupplier = await supplierService.create(createSupplierSchema.parse(req.body));
    sendCreated(res, newSupplier);
  }),

  getSuppliers: asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const suppliers = await supplierService.getAll(search);
    sendSuccess(res, suppliers);
  }),
}; 