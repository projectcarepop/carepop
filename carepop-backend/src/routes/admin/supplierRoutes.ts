import { Router } from 'express';
import { supplierController } from '../../controllers/admin/supplierController';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Protect all supplier routes
router.use(authMiddleware);
router.use(authorize(['admin'])); // Only admins can manage suppliers

router
  .route('/')
  .post(supplierController.createSupplier)
  .get(supplierController.getAllSuppliers);

// router
//   .route('/:id')
//   .get(asyncHandler(supplierController.getSupplierById))
//   .patch(asyncHandler(supplierController.updateSupplier))
//   .delete(asyncHandler(supplierController.deleteSupplier));

export default router; 