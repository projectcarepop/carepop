import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '@/controllers/admin/appointment.controller';
import { getReportByAppointmentId } from '@/controllers/admin/appointment-report.admin.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdParamSchema,
  reportAppointmentIdParamSchema,
  listAppointmentsQuerySchema,
} from '@/validation/admin/appointment.validation';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createAppointmentSchema }), createAppointment)
  .get(validateRequest({ query: listAppointmentsQuerySchema }), getAppointments);

router.route('/:id')
  .get(validateRequest({ params: appointmentIdParamSchema }), getAppointmentById)
  .put(validateRequest({ params: appointmentIdParamSchema, body: updateAppointmentSchema }), updateAppointment)
  .delete(validateRequest({ params: appointmentIdParamSchema }), deleteAppointment);

// Route for fetching a report for a specific appointment
router.route('/:appointmentId/report')
  .get(validateRequest({ params: reportAppointmentIdParamSchema }), getReportByAppointmentId);

export default router; 