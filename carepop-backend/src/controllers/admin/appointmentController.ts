import { Request, Response } from 'express';
import { appointmentService } from '../../services/admin/appointmentService';
import { updateAppointmentSchema } from '../../validation/admin/appointmentValidation';
import { commonSchemas } from '../../validation/commonSchemas';
import { sendSuccess } from '../../utils/responseHandler';

export const appointmentController = {
  getAllAppointments: async (req: Request, res: Response) => {
    const appointments = await appointmentService.getAll();
    sendSuccess(res, appointments);
  },

  getAppointmentById: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const appointment = await appointmentService.getById(id);
    sendSuccess(res, appointment);
  },

  updateAppointment: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const appointmentData = updateAppointmentSchema.parse(req.body);
    const updatedAppointment = await appointmentService.update(id, appointmentData);
    sendSuccess(res, updatedAppointment);
  },
}; 