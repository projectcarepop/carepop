import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InventoryAdminService } from '@/services/admin/inventory.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listInventoryQuerySchema } from '@/validation/admin/inventory.validation';

const inventoryService = new InventoryAdminService();

export const createInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const newItem = await inventoryService.create(req.body);
  sendCreated(res, newItem);
});

export const getInventoryItems = asyncHandler(async (req: Request, res: Response) => {
  const query = await listInventoryQuerySchema.parseAsync(req.query);
  const result = await inventoryService.findAll(query);
  sendSuccess(res, result);
});

export const getInventoryItemById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await inventoryService.findOne(id);
  if (!item) {
    throw new AppError('Inventory item not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, item);
});

export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedItem = await inventoryService.update(id, req.body);
  if (!updatedItem) {
    throw new AppError('Inventory item not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedItem);
});

export const deleteInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await inventoryService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 