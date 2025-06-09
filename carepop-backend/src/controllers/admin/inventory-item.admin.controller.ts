import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InventoryItemAdminService } from '../../services/admin/inventory-item.admin.service';
import { createInventoryItemSchema, updateInventoryItemSchema } from '../../validation/admin/inventory-item.admin.validation';

export class InventoryItemAdminController {
  constructor(private inventoryItemService: InventoryItemAdminService) {}

  async getAllInventoryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const { data, total } = await this.inventoryItemService.getAllInventoryItems({ page, limit, search });
      
      res.status(StatusCodes.OK).json({ 
        success: true, 
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await this.inventoryItemService.getInventoryItemById(id);
      if (!item) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Inventory item not found' });
      }
      res.status(StatusCodes.OK).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async createInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedBody = createInventoryItemSchema.parse(req.body);
      const newItem = await this.inventoryItemService.createInventoryItem(validatedBody);
      res.status(StatusCodes.CREATED).json({ success: true, data: newItem });
    } catch (error) {
      next(error);
    }
  }

  async updateInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedBody = updateInventoryItemSchema.parse(req.body);
      await this.inventoryItemService.updateInventoryItem(id, validatedBody);
      res.status(StatusCodes.OK).json({ success: true, message: 'Inventory item updated successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async deleteInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.inventoryItemService.deleteInventoryItem(id);
      res.status(StatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
} 