import { Router } from 'express';
import clinicRoutes from './clinic.routes';
import serviceRoutes from './service.routes';

const publicRouter = Router();

publicRouter.use('/clinics', clinicRoutes);
publicRouter.use('/services', serviceRoutes);

export default publicRouter; 