import { Router } from 'express';
import { AppointmentAdminController } from '../../controllers/admin/appointment.admin.controller';
import { AppointmentAdminService } from '../../services/admin/appointment.admin.service';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();

const appointmentAdminService = new AppointmentAdminService();
const appointmentAdminController = new AppointmentAdminController(appointmentAdminService);

router.get(
  '/',
  authenticateToken,
  isAdmin,
  appointmentAdminController.getAllAppointments.bind(appointmentAdminController)
);

router.patch(
  '/:appointmentId/confirm',
  authenticateToken,
  isAdmin,
  appointmentAdminController.confirmAppointment.bind(appointmentAdminController)
);

router.patch(
  '/:appointmentId/cancel',
  authenticateToken,
  isAdmin,
  appointmentAdminController.cancelAppointment.bind(appointmentAdminController)
);

export default router; 