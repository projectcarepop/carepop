import { Router } from 'express';
import { getMyFutureAppointments, getMyPastAppointments, cancelMyAppointment } from '@/controllers/public/appointment.controller';
import { authMiddleware } from '@/lib/middleware/auth.middleware';

const router = Router();

// These routes require a user to be authenticated
router.use(authMiddleware);

router.get('/my/future', getMyFutureAppointments);
router.get('/my/past', getMyPastAppointments);
router.patch('/:appointmentId/cancel', cancelMyAppointment);


export default router; 