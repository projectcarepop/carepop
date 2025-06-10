import { Router } from 'express';
import clinicRoutes from './clinic.routes';
import serviceRoutes from './service.routes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const publicRouter = Router();

publicRouter.use('/auth', authRoutes);
publicRouter.use('/clinics', clinicRoutes);
publicRouter.use('/services', serviceRoutes);
publicRouter.use('/users', userRoutes);

export default publicRouter; 