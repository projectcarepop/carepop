import { Router } from 'express';
import { healthController } from '@/controllers/public/health.controller';
import { authMiddleware } from '@/lib/middleware/auth.middleware';

const router = Router();

// All health routes require an authenticated user
router.use(authMiddleware);

// POST /api/v1/public/health-entries
router.post('/', healthController.createEntry);

// GET /api/v1/public/health-entries?type=MOOD
router.get('/', healthController.getEntries);

export default router; 