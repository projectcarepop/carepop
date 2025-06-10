import { Router } from 'express';
import { inventoryController } from '../../controllers/admin/inventoryController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

// All inventory routes require admin privileges
router.use(authMiddleware);
router.use(authorize(['admin', 'inventory_manager'])); // Example of multiple roles

router
  .route('/')
  .post(asyncHandler(inventoryController.createItem))
  .get(asyncHandler(inventoryController.getAllItems));

router
  .route('/:id')
  .get(asyncHandler(inventoryController.getItemById))
  .patch(asyncHandler(inventoryController.updateItem))
  .delete(asyncHandler(inventoryController.deleteItem));

export default router; 