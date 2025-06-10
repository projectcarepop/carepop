import { Router } from 'express';
import { AdminClinicController } from '@/controllers/admin/clinic.admin.controller';
import { authMiddleware, isAdmin } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { 
  createClinicSchema, 
  updateClinicSchema,
  listClinicsQuerySchema,
  clinicIdParamSchema
} from '@/validation/admin/clinic.admin.validation';
import { AdminClinicService } from '@/services/admin/clinic.admin.service';
import clinicProviderAdminRoutes from './clinicProvider.admin.routes';

const router = Router();
const adminClinicService = new AdminClinicService(); // Instantiate the service
const adminClinicController = new AdminClinicController(adminClinicService); // Pass the service to the controller

// Apply auth middleware to all routes in this file
router.use(authMiddleware, isAdmin);

// POST /api/v1/admin/clinics - Create a new clinic
router.post(
  '/',
  validate({ body: createClinicSchema }),
  adminClinicController.createClinic
);

// GET /api/v1/admin/clinics - List all clinics
// Query Params: page, limit, isActive, sortBy, sortOrder, searchByName
router.get(
  '/',
  validate({ query: listClinicsQuerySchema }),
  adminClinicController.listClinics
);

// GET /api/v1/admin/clinics/:clinicId - Get a specific clinic
router.get(
  '/:clinicId',
  validate({ params: clinicIdParamSchema }),
  adminClinicController.getClinicById
);

// PUT /api/v1/admin/clinics/:clinicId - Update a specific clinic
router.put(
  '/:clinicId',
  validate({ params: clinicIdParamSchema, body: updateClinicSchema }),
  adminClinicController.updateClinic
);

// DELETE /api/v1/admin/clinics/:clinicId - Delete a specific clinic
router.delete(
  '/:clinicId',
  validate({ params: clinicIdParamSchema }),
  adminClinicController.deleteClinic
);

// Mount provider management routes under /:clinicId/providers
router.use('/:clinicId/providers', clinicProviderAdminRoutes);

export default router; 