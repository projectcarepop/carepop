import { Request, Response, NextFunction } from 'express';
import { AppointmentAdminService } from '../../services/admin/appointment.admin.service';
import { AppError } from '../../utils/errors';

export class AppointmentAdminController {
  constructor(private appointmentAdminService: AppointmentAdminService) {
    this.confirmAppointment = this.confirmAppointment.bind(this);
    this.getAllAppointments = this.getAllAppointments.bind(this);
  }

  async confirmAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new AppError('Appointment ID is required.', 400);
      }

      const confirmedAppointment = await this.appointmentAdminService.confirmAppointment(appointmentId);

      res.status(200).json({
        message: 'Appointment confirmed successfully.',
        data: confirmedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointments = await this.appointmentAdminService.getAllAppointments();
      res.status(200).json({
        message: 'Appointments retrieved successfully.',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }
} 