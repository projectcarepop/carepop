import { Request, Response } from 'express';
import { inventoryService } from '../../services/admin/inventoryService';
import { createInventoryItemSchema, updateInventoryItemSchema } from '../../validation/admin/inventoryValidation';
import { commonSchemas } from '../../validation/commonSchemas';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/responseHandler';

export const inventoryController = {
  createItem: async (req: Request, res: Response) => {
    const itemData = createInventoryItemSchema.parse(req.body);
    const newItem = await inventoryService.create(itemData);
    sendCreated(res, newItem);
  },

  getAllItems: async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const items = await inventoryService.getAll(searchQuery);
    sendSuccess(res, items);
  },

  getItemById: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const item = await inventoryService.getById(id);
    sendSuccess(res, item);
  },

  updateItem: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const itemData = updateInventoryItemSchema.parse(req.body);
    const updatedItem = await inventoryService.update(id, itemData);
    sendSuccess(res, updatedItem);
  },

  deleteItem: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await inventoryService.delete(id);
    sendNoContent(res);
  },
}; 