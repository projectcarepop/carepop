import { Router } from 'express';
import clinicRoutes from './clinic.routes';
import serviceRoutes from './service.routes';
import authRoutes from './authRoutes';

const publicRouter = Router();

publicRouter.use('/auth', authRoutes);
publicRouter.use('/clinics', clinicRoutes);
publicRouter.use('/services', serviceRoutes);

export default publicRouter; 