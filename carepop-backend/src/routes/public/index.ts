import { Router } from 'express';
import authRoutes from './auth.routes';
import clinicRoutes from './clinic.routes';
import serviceRoutes from './service.routes';
import appointmentRoutes from './appointment.routes';
import userRoutes from './user.routes';
import healthBuddyRoutes from './health-buddy.routes';
import medicationRoutes from './medication.routes';
import navigationRoutes from './navigation.public.routes';
import medicalRecordRoutes from './medicalRecord.public.routes';
import { healthRoutes } from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clinics', clinicRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/health-buddy', healthBuddyRoutes);
router.use('/medications', medicationRoutes);
router.use('/navigation', navigationRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/health-entries', healthRoutes);

export { router as publicRoutes }; 