import { Request, Response } from 'express';
import { AppointmentAdminService } from '../../services/admin/appointment.admin.service';
import { AppError } from '../../utils/errors';

const appointmentService = new AppointmentAdminService();

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clinicId, page, limit, search } = req.query;
        const result = await appointmentService.getAllAppointments({
            clinicId: clinicId as string,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            search: search as string,
        });
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            res.status(500).json({ message });
        }
    }
};

export const confirmAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.params;
        const updatedAppointment = await appointmentService.confirmAppointment(appointmentId);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            res.status(500).json({ message });
        }
    }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            throw new AppError('Cancellation reason is required.', 400);
        }

        const updatedAppointment = await appointmentService.cancelAppointment(appointmentId, reason);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            res.status(500).json({ message });
        }
    }
};

export const getAppointmentReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.params;
        if (!appointmentId) {
            throw new AppError('Appointment ID is required.', 400);
        }
        const report = await appointmentService.getAppointmentReport(appointmentId);
        res.status(200).json({
            message: 'Appointment report retrieved successfully.',
            data: report,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            console.error(error);
            const message = error instanceof Error ? error.message : 'An internal server error occurred';
            res.status(500).json({ message });
        }
    }
}; 