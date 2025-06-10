import { Router } from 'express';
import * as clinicPublicController from '@/controllers/public/clinic.controller';

const router = Router();

router.get('/', clinicPublicController.listPublicClinics);

export default router; 