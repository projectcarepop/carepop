import { Router } from 'express';
import { menstrualController } from '../../controllers/public/menstrual.controller';
import { authMiddleware } from '../../lib/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// --- Cycle Routes ---
router.get('/cycles', menstrualController.getCycles);
router.post('/cycles', menstrualController.startNewCycle);
router.patch('/cycles/:id', menstrualController.endCurrentCycle);


// --- Symptom Routes ---
router.get('/symptoms', menstrualController.getSymptoms);
router.post('/symptoms', menstrualController.upsertSymptoms); // Using POST for upsert

export default router; 