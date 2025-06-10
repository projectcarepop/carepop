import { Router } from 'express';
import * as userController from '@/controllers/public/userController';
import { authMiddleware } from '@/lib/middleware/auth.middleware';

const router = Router();

// This route is for the authenticated user to get their own profile.
// The authMiddleware will verify the JWT and attach the user object to the request.
router.get('/profile', authMiddleware, userController.getMyProfile);

export default router; 