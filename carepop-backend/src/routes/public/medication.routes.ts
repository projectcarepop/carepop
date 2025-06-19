import { Router } from 'express';
import { medicationController } from '../../controllers/public/medication.controller';
import { authMiddleware } from '../../lib/middleware/auth.middleware';

const router = Router();

// All medication routes should be protected
router.use(authMiddleware);

// --- Medication CRUD ---
router.get('/', medicationController.getMeds);
router.post('/', medicationController.createMed);
router.patch('/:id', medicationController.updateMed);
router.delete('/:id', medicationController.deleteMed);

// --- Logging ---
router.get('/logs', medicationController.getLogs);
router.post('/logs', medicationController.logTaken);

export default router; 