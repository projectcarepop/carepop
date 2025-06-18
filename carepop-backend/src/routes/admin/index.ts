import { Router } from 'express';
import { authMiddleware } from '../../lib/middleware/auth.middleware';
import { authorize } from '../../lib/middleware/role.middleware';
import { createOrUpdateReport } from '@/controllers/admin/appointment-report.admin.controller';

// Import modular route handlers
import inventoryRoutes from './inventory.routes';
import supplierRoutes from './supplier.routes';
import clinicRoutes from './clinic.routes';
import providerRoutes from './provider.routes';
import serviceCategoryRoutes from './service-category.routes';
import serviceRoutes from './service.routes';
import userRoutes from './user.routes';
import appointmentRoutes from './appointment.routes';
import profileRoutes from './profile.routes';
import dashboardRoutes from './dashboard.routes';
import medicalRecordAdminRoutes from './medicalRecord.admin.routes';
import debugRoutes from './debug.routes';

const adminRouter = Router();

// Apply security middleware to all admin routes
adminRouter.use(authMiddleware);
adminRouter.use(authorize(['admin', 'super-admin']));

// Use modular routers
adminRouter.use('/inventory', inventoryRoutes);
adminRouter.use('/suppliers', supplierRoutes);
adminRouter.use('/clinics', clinicRoutes);
adminRouter.use('/providers', providerRoutes);
adminRouter.use('/service-categories', serviceCategoryRoutes);
adminRouter.use('/services', serviceRoutes);
adminRouter.use('/users', userRoutes);
adminRouter.use('/appointments', appointmentRoutes);
adminRouter.use('/profiles', profileRoutes);
adminRouter.use('/dashboard', dashboardRoutes);
adminRouter.use('/medical-records', medicalRecordAdminRoutes);
adminRouter.use('/debug', debugRoutes);

// Route for creating or updating an appointment report
adminRouter.post('/reports', createOrUpdateReport);

export { adminRouter as adminRoutes }; 