import { Router } from 'express';
import { getMyProfile } from '@/controllers/public/profile.controller';
import { authMiddleware } from '@/lib/middleware/auth.middleware';

const router = Router();

router.get('/profile', authMiddleware, getMyProfile);

export default router; 