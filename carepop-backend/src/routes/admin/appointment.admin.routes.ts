import { Router } from 'express';
import * as appointmentController from '../../controllers/admin/appointment.admin.controller';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validate';
import { listAppointmentsQuerySchema } from '../../validation/admin/appointment.admin.validation';

const router = Router();

router.get('/', authenticateToken, isAdmin, validate({ query: listAppointmentsQuerySchema }), appointmentController.listAllAppointments);
router.patch('/:appointmentId/confirm', authenticateToken, isAdmin, appointmentController.confirmAppointment);
router.patch('/:appointmentId/cancel', authenticateToken, isAdmin, appointmentController.cancelAppointment);
router.get('/:appointmentId/report', authenticateToken, isAdmin, appointmentController.getAppointmentReport);

export default router; 