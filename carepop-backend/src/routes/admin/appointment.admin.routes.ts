import { Router } from 'express';
import * as appointmentController from '../../controllers/admin/appointment.admin.controller';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, isAdmin, appointmentController.getAllAppointments);
router.patch('/:appointmentId/confirm', authenticateToken, isAdmin, appointmentController.confirmAppointment);
router.patch('/:appointmentId/cancel', authenticateToken, isAdmin, appointmentController.cancelAppointment);
router.get('/:appointmentId/report', authenticateToken, isAdmin, appointmentController.getAppointmentReport);

export default router; 