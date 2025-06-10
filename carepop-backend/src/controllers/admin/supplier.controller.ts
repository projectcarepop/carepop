import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SupplierAdminService } from '@/services/admin/supplier.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listSuppliersQuerySchema } from '@/validation/admin/supplier.validation';

const supplierService = new SupplierAdminService();

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const newSupplier = await supplierService.create(req.body);
  sendCreated(res, newSupplier);
});

export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const query = await listSuppliersQuerySchema.parseAsync(req.query);
  const result = await supplierService.findAll(query);
  sendSuccess(res, result);
});

export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await supplierService.findOne(id);
  if (!supplier) {
    throw new AppError('Supplier not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, supplier);
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedSupplier = await supplierService.update(id, req.body);
  if (!updatedSupplier) {
    throw new AppError('Supplier not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedSupplier);
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await supplierService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 