import { Router } from 'express';
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '@/controllers/admin/supplier.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierIdParamSchema,
  listSuppliersQuerySchema,
} from '@/validation/admin/supplier.validation';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createSupplierSchema }), createSupplier)
  .get(validateRequest({ query: listSuppliersQuerySchema }), getSuppliers);

router.route('/:id')
  .get(validateRequest({ params: supplierIdParamSchema }), getSupplierById)
  .put(validateRequest({ params: supplierIdParamSchema, body: updateSupplierSchema }), updateSupplier)
  .delete(validateRequest({ params: supplierIdParamSchema }), deleteSupplier);

export default router; 