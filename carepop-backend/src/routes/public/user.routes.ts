import { Router } from 'express';
import { userController } from '../../controllers/public/user.controller';

const router = Router();

router.get('/:userId/profile', userController.getProfile);

export default router; 