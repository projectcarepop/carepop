import { Request, Response } from 'express';
import { AppointmentService, createAppointment as createAppointmentService } from '@/services/public/appointment.service';
import { sendSuccess } from '@/utils/responseHandler';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { z } from 'zod';
import { AppError } from '@/lib/utils/appError';

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

const CreateAppointmentSchema = z.object({
  clinicId: z.string().uuid(),
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  startTime: z.string().datetime(),
  notes: z.string().optional(),
});

export const createAppointment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validationResult = CreateAppointmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(`Invalid request body: ${validationResult.error.flatten().fieldErrors}`, 400);
  }

  if (!req.user) {
    throw new AppError('User not found in request. Authentication error.', 401);
  }

  const newAppointment = await createAppointmentService({
    ...validationResult.data,
    userId: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Appointment created successfully.',
    data: newAppointment,
  });
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