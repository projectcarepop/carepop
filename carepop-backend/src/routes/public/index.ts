import { Router } from 'express';
import authRoutes from './auth.routes';
import appointmentRoutes from './appointment.routes';
import clinicRoutes from './clinic.routes';
import navigationRoutes from './navigation.public.routes';
import serviceRoutes from './service.routes';
import providerRoutes from './provider.routes';
import userRoutes from './user.routes';
import healthBuddyRoutes from './health-buddy.routes';
import medicationRoutes from './medication.routes';
import menstrualRoutes from './menstrual.routes';
import medicalRecordRoutes from './medicalRecord.public.routes';
import healthRoutes from './health.routes';
import { availabilityRoutes } from './availability.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/clinics', clinicRoutes);
router.use('/navigation', navigationRoutes);
router.use('/services', serviceRoutes);
router.use('/providers', providerRoutes);
router.use('/users', userRoutes);
router.use('/health-buddy', healthBuddyRoutes);
router.use('/medications', medicationRoutes);
router.use('/menstrual', menstrualRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/health-entries', healthRoutes);
router.use('/availability', availabilityRoutes);

export default router; 