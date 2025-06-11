import { Router } from 'express';
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
} from '@/controllers/admin/clinic.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createClinicSchema,
  updateClinicSchema,
  clinicIdParamSchema,
  listClinicsQuerySchema,
} from '@/validation/admin/clinic.validation';

// Nested routes for providers within a clinic
import clinicProviderRoutes from './clinic-provider.routes';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createClinicSchema }), createClinic)
  .get(validateRequest({ query: listClinicsQuerySchema }), getClinics);

router.route('/:id')
  .get(validateRequest({ params: clinicIdParamSchema }), getClinicById)
  .put(validateRequest({ params: clinicIdParamSchema, body: updateClinicSchema }), updateClinic)
  .delete(validateRequest({ params: clinicIdParamSchema }), deleteClinic);

// Nested routes for providers within a clinic
router.use('/:clinicId/providers', clinicProviderRoutes);

export default router; 