import { Request, Response } from 'express';
import { supplierSchemas } from 'validation/admin/supplierSchemas';
import { supplierService } from 'services/admin/supplierService';
import { tryCatch } from 'utils/tryCatch';
import { sendCreated, sendSuccess } from 'utils/responseHandlers';

export const supplierController = {
  createSupplier: tryCatch(async (req: Request, res: Response) => {
    const supplierData = supplierSchemas.create.parse(req.body);
    const newSupplier = await supplierService.create(supplierData);
    sendCreated(res, newSupplier);
  }),

  getAllSuppliers: tryCatch(async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const suppliers = await supplierService.getAll(searchQuery);
    sendSuccess(res, suppliers);
  }),

  // ... other controller methods would follow
}; 