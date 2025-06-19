import { Router } from 'express';
import * as providerController from '../../controllers/public/provider.controller';

const router = Router();

router.get('/:providerId/availability', providerController.getProviderAvailability);

export default router; 