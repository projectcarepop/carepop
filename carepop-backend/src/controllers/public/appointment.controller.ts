import { Request, Response } from 'express';
import { AppointmentService } from '@/services/public/appointment.service';
import { sendSuccess } from '@/utils/responseHandler';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { z } from 'zod';

// Define the AuthenticatedRequest type locally
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    // Add other user properties from the JWT payload if needed
  };
}

const appointmentService = new AppointmentService();

const createAppointmentSchema = z.object({
    providerId: z.string().uuid(),
    serviceId: z.string().uuid(),
    startTime: z.string().datetime(),
});

export const createAppointment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validation = createAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
        throw new Error(`Invalid request body: ${validation.error.message}`);
    }
    
    const patientId = req.user!.id;
    const { providerId, serviceId, startTime } = validation.data;

    const newAppointment = await appointmentService.createAppointment({
        patientId,
        providerId,
        serviceId,
        startTime,
    });

    sendSuccess(res, { data: newAppointment, message: 'Appointment booked successfully.' }, 201);
});

export const getMyFutureAppointments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const appointments = await appointmentService.getFutureAppointmentsByUserId(userId);
    sendSuccess(res, { data: appointments });
});

export const getMyPastAppointments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const appointments = await appointmentService.getPastAppointmentsByUserId(userId);
    sendSuccess(res, { data: appointments });
});

export const cancelMyAppointment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { appointmentId } = req.params;
    const appointment = await appointmentService.cancelAppointment(appointmentId, userId);
    sendSuccess(res, { data: appointment, message: 'Appointment cancelled successfully.' });
}); 