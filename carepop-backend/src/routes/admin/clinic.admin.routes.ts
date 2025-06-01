import { Router } from 'express';
import { AdminClinicController } from '../../controllers/admin/clinic.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware'; // Corrected path and name
import { isAdmin } from '../../middleware/role.middleware'; // Corrected path and name
import clinicProviderAdminRoutes from './clinicProvider.admin.routes'; // Import the new routes

const router = Router();
const adminClinicController = new AdminClinicController();

// POST /api/v1/admin/clinics - Create a new clinic
router.post(
  '/',
  authenticateToken, // Use the correct middleware function
  isAdmin,         
  adminClinicController.createClinic
);

// GET /api/v1/admin/clinics - List all clinics
// Query Params: page, limit, isActive, sortBy, sortOrder, searchByName
router.get(
  '/',
  authenticateToken,
  isAdmin,
  adminClinicController.listClinics
);

// GET /api/v1/admin/clinics/:clinicId - Get a specific clinic
router.get(
  '/:clinicId',
  authenticateToken,
  isAdmin,
  adminClinicController.getClinicById
);

// PUT /api/v1/admin/clinics/:clinicId - Update a specific clinic
router.put(
  '/:clinicId',
  authenticateToken,
  isAdmin,
  adminClinicController.updateClinic
);

// DELETE /api/v1/admin/clinics/:clinicId - Delete a specific clinic
router.delete(
  '/:clinicId',
  authenticateToken,
  isAdmin,
  adminClinicController.deleteClinic
);

// Mount provider management routes under /:clinicId/providers
router.use('/:clinicId/providers', clinicProviderAdminRoutes);

// Future routes for admin clinic management:
// DELETE /api/v1/admin/clinics/:clinicId - Delete a specific clinic
// router.delete('/:clinicId', isAuthenticated, isAdmin, adminClinicController.deleteClinic);

export default router; 