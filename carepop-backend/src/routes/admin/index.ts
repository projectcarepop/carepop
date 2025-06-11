import { Router } from 'express';
import clinicAdminRoutes from './clinic.admin.routes';
import providerAdminRoutes from './provider.admin.routes';
import userAdminRoutes from './user.admin.routes';
import serviceAdminRoutes from './service.admin.routes';
import serviceCategoryAdminRoutes from './service-category.admin.routes';
import providerServiceAdminRoutes from './provider-service.admin.routes';
import appointmentAdminRoutes from './appointment.admin.routes';
import reportAdminRoutes from './report.admin.routes';
import medicalRecordAdminRoutes from './medicalRecord.admin.routes';
import dashboardAdminRoutes from './dashboard.admin.routes';
import profileAdminRoutes from './profile.admin.routes';
import inventoryItemAdminRoutes from './inventory-item.admin.routes';
import supplierAdminRoutes from './supplier.admin.routes';

const router = Router();

router.use('/clinics', clinicAdminRoutes);
router.use('/providers', providerAdminRoutes);
router.use('/users', userAdminRoutes);
router.use('/services', serviceAdminRoutes);
router.use('/service-categories', serviceCategoryAdminRoutes);
router.use('/provider-services', providerServiceAdminRoutes);
router.use('/appointments', appointmentAdminRoutes);
router.use('/reports', reportAdminRoutes);
router.use('/medical-records', medicalRecordAdminRoutes);
router.use('/dashboard', dashboardAdminRoutes);
router.use('/profiles', profileAdminRoutes);
router.use('/inventory-items', inventoryItemAdminRoutes);
router.use('/suppliers', supplierAdminRoutes);

export default router; 