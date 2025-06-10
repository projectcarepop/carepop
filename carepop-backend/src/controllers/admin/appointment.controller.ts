import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppointmentAdminService } from '@/services/admin/appointment.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listAppointmentsQuerySchema } from '@/validation/admin/appointment.validation';

const appointmentService = new AppointmentAdminService();

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const newAppointment = await appointmentService.create(req.body);
  sendCreated(res, newAppointment);
});

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const query = await listAppointmentsQuerySchema.parseAsync(req.query);
  const result = await appointmentService.findAll(query);
  sendSuccess(res, result);
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const appointment = await appointmentService.findOne(id);
  if (!appointment) {
    throw new AppError('Appointment not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, appointment);
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedAppointment = await appointmentService.update(id, req.body);
  if (!updatedAppointment) {
    throw new AppError('Appointment not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedAppointment);
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await appointmentService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 