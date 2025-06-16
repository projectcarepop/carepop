import { Request, Response } from 'express';
import { AppointmentService } from '@/services/public/appointment.service';
import { sendSuccess } from '@/utils/responseHandler';
import { asyncHandler } from '@/lib/utils/asyncHandler';

const appointmentService = new AppointmentService();

export const getMyFutureAppointments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const appointments = await appointmentService.getFutureAppointmentsByUserId(userId);
  sendSuccess(res, appointments);
});

export const getMyPastAppointments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const appointments = await appointmentService.getPastAppointmentsByUserId(userId);
  sendSuccess(res, appointments);
});

export const cancelMyAppointment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    
    const updatedAppointment = await appointmentService.cancelAppointment(appointmentId, userId);
    
    sendSuccess(res, updatedAppointment);
}); 