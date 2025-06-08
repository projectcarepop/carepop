import { Router } from 'express';
import { SupplierAdminController } from '../../controllers/admin/supplier.admin.controller';
import { SupplierAdminService } from '../../services/admin/supplier.admin.service';
import { supabase } from '../../config/supabaseClient';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware';

const router = Router();

const supplierService = new SupplierAdminService(supabase);
const supplierController = new SupplierAdminController(supplierService);

// Protect all routes in this file
router.use(authenticateToken, isAdmin);

router.get('/', (req, res, next) => supplierController.getAllSuppliers(req, res, next));
router.post('/', (req, res, next) => supplierController.createSupplier(req, res, next));
router.get('/:id', (req, res, next) => supplierController.getSupplierById(req, res, next));
router.put('/:id', (req, res, next) => supplierController.updateSupplier(req, res, next));
router.delete('/:id', (req, res, next) => supplierController.deleteSupplier(req, res, next));

export default router; 