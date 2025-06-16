import { Router } from 'express';
import { healthBuddyController } from '@/controllers/public/healthBuddy.controller';
import { authMiddleware } from '@/lib/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Mood
router.post('/mood-logs', healthBuddyController.logMood);
router.get('/mood-logs', healthBuddyController.getMoodLogs);

// Blood Pressure
router.post('/blood-pressure-logs', healthBuddyController.logBloodPressure);
router.get('/blood-pressure-logs', healthBuddyController.getBloodPressureLogs);

// Daily Activity
router.post('/activity-logs', healthBuddyController.logDailyActivity);
router.get('/activity-logs', healthBuddyController.getDailyActivityLogs);

export default router; 