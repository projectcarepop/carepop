import { Router } from 'express';
import * as profileController from '@/controllers/admin/profile.controller';

const router = Router();

router.get('/', profileController.getAllProfiles);

export default router; 