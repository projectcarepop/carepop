import { Router } from 'express';
import * as clinicPublicController from '../../controllers/public/clinic.controller';

const router = Router();

router.get('/', clinicPublicController.listPublicClinics);
router.get('/:clinicId/services', clinicPublicController.listServicesForClinic);
router.get('/:clinicId/providers', clinicPublicController.listProvidersForServiceInClinic);

export default router; 