import { Router } from 'express';
import * as servicePublicController from '@/controllers/public/service.controller';

const router = Router();

router.get('/', servicePublicController.listPublicServices);

export default router; 