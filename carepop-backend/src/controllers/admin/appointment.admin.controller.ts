import { Request, Response, NextFunction } from 'express';
import { AppointmentAdminService } from '../../services/admin/appointment.admin.service';
import { AppError } from '../../utils/errors';

export class AppointmentAdminController {
  constructor(private appointmentAdminService: AppointmentAdminService) {
    this.confirmAppointment = this.confirmAppointment.bind(this);
    this.getAllAppointments = this.getAllAppointments.bind(this);
    this.cancelAppointment = this.cancelAppointment.bind(this);
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
      const { clinicId } = req.query;
      const appointments = await this.appointmentAdminService.getAllAppointments(clinicId as string | undefined);
      res.status(200).json({
        message: 'Appointments retrieved successfully.',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;

      if (!appointmentId) {
        throw new AppError('Appointment ID is required.', 400);
      }
      if (!reason) {
          throw new AppError('A cancellation reason is required.', 400);
      }

      const cancelledAppointment = await this.appointmentAdminService.cancelAppointment(appointmentId, reason);

      res.status(200).json({
        message: 'Appointment cancelled successfully.',
        data: cancelledAppointment,
      });
    } catch (error) {
      next(error);
    }
  }
} 