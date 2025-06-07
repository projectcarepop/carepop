import { Router } from 'express';
import { AppointmentAdminController } from '../../controllers/admin/appointment.admin.controller';
import { AppointmentAdminService } from '../../services/admin/appointment.admin.service';
import { supabase } from '../../config/supabaseClient';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();

const appointmentAdminService = new AppointmentAdminService(supabase);
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

export default router; 