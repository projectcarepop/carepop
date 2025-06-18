import { Router } from 'express';
import * as servicePublicController from '@/controllers/public/service.controller';

const router = Router();

router.get('/', servicePublicController.listPublicServices);
router.get('/:serviceId/providers', servicePublicController.listProvidersForService);

export default router; 