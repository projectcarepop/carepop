import { Router } from 'express';
import * as appointmentController from '@/controllers/admin/appointment.admin.controller';
import { authMiddleware, isAdmin } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { listAppointmentsQuerySchema } from '@/validation/admin/appointment.admin.validation';

const router = Router();

router.get('/', authMiddleware, isAdmin, validate({ query: listAppointmentsQuerySchema }), appointmentController.listAllAppointments);
router.patch('/:appointmentId/confirm', authMiddleware, isAdmin, appointmentController.confirmAppointment);
router.patch('/:appointmentId/cancel', authMiddleware, isAdmin, appointmentController.cancelAppointment);
router.get('/:appointmentId/report', authMiddleware, isAdmin, appointmentController.getAppointmentReport);

export default router; 