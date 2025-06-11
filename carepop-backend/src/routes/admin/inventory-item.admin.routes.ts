import { Router } from 'express';
import { InventoryItemAdminController } from '../../controllers/admin/inventory-item.admin.controller';
import { InventoryItemAdminService } from '../../services/admin/inventory-item.admin.service';
import { supabase } from '../../config/supabaseClient';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware';

const router = Router();

const inventoryItemService = new InventoryItemAdminService(supabase);
const inventoryItemController = new InventoryItemAdminController(inventoryItemService);

// Protect all routes in this file
router.use(authenticateToken, isAdmin);

router.get('/', (req, res, next) => inventoryItemController.getAllInventoryItems(req, res, next));
router.post('/', (req, res, next) => inventoryItemController.createInventoryItem(req, res, next));
router.get('/:id', (req, res, next) => inventoryItemController.getInventoryItemById(req, res, next));
router.put('/:id', (req, res, next) => inventoryItemController.updateInventoryItem(req, res, next));
router.delete('/:id', (req, res, next) => inventoryItemController.deleteInventoryItem(req, res, next));

export default router; 