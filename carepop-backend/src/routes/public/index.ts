import { Router } from 'express';
import authRoutes from '../authRoutes';
import directoryRoutes from '../directoryRoutes';
import serviceRoutes from '../serviceRoutes';
import providerRoutes from '../providerRoutes';
import availabilityRoutes from '../availabilityRoutes';
import profileRoutes from '../profileRoutes';
import appointmentRoutes from '../appointmentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/directory', directoryRoutes);
router.use('/services', serviceRoutes);
router.use('/providers', providerRoutes);
router.use('/availability', availabilityRoutes);
router.use('/profiles', profileRoutes);
router.use('/appointments', appointmentRoutes);


export default router; 