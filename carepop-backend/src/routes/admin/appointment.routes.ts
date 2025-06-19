import express from 'express';
import { getAppointments, getAppointmentById } from '../../controllers/admin/appointment.controller';
// import { createAppointment, updateAppointment, deleteAppointment } from '../../controllers/admin/appointment.controller';
// import { getReportByAppointmentId } from '../../controllers/admin/appointment-report.admin.controller';

const router = express.Router();

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
// router.post('/', createAppointment);
// router.patch('/:id', updateAppointment);
// router.delete('/:id', deleteAppointment);

// Appointment reports
// router.get('/:appointmentId/report', getReportByAppointmentId);

export default router; 