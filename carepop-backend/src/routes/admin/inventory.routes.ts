import { Router } from 'express';
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/controllers/admin/inventory.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  inventoryIdParamSchema,
  listInventoryQuerySchema
} from '@/validation/admin/inventory.validation';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createInventoryItemSchema }), createInventoryItem)
  .get(validateRequest({ query: listInventoryQuerySchema }), getInventoryItems);

router.route('/:id')
  .get(validateRequest({ params: inventoryIdParamSchema }), getInventoryItemById)
  .put(validateRequest({ params: inventoryIdParamSchema, body: updateInventoryItemSchema }), updateInventoryItem)
  .delete(validateRequest({ params: inventoryIdParamSchema }), deleteInventoryItem);

export default router; 