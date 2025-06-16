import { Router } from 'express';
import clinicRoutes from './clinic.routes';
import serviceRoutes from './service.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import navigationRoutes from './navigation.public.routes';
import appointmentRoutes from './appointment.routes';
import medicalRecordRoutes from './medicalRecord.public.routes';


const publicRouter = Router();

publicRouter.use('/auth', authRoutes);
publicRouter.use('/clinics', clinicRoutes);
publicRouter.use('/services', serviceRoutes);
publicRouter.use('/users', userRoutes);
publicRouter.use('/navigation', navigationRoutes);
publicRouter.use('/appointments', appointmentRoutes);
publicRouter.use('/medical-records', medicalRecordRoutes);

export default publicRouter; 