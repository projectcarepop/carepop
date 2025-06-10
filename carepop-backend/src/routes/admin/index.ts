import { Router } from 'express';
import inventoryRoutes from './inventoryRoutes';
import supplierRoutes from './supplierRoutes';
import clinicRoutes from './clinicRoutes';
import serviceCategoryRoutes from './serviceCategoryRoutes';
import serviceRoutes from './serviceRoutes';
import providerRoutes from './providerRoutes';
import userRoutes from './userRoutes';
import appointmentRoutes from './appointmentRoutes';

const router = Router();

router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/clinics', clinicRoutes);
router.use('/service-categories', serviceCategoryRoutes);
router.use('/services', serviceRoutes);
router.use('/providers', providerRoutes);
router.use('/users', userRoutes);
router.use('/appointments', appointmentRoutes);

export default router; 