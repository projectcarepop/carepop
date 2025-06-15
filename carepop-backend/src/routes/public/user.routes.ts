import { Router } from 'express';
import { userController } from '../../controllers/public/user.controller';
import { authMiddleware } from '../../lib/middleware/auth.middleware';

const router = Router();

router.get('/:userId/profile', userController.getProfile);

// A new route for an authenticated user to update their own profile
router.put('/profile', authMiddleware, userController.updateMyProfile);

export default router; 