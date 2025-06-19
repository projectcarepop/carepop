import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { appointmentService } from '../../services/admin/appointment.service';
import { ApiResponse } from '../../utils/ApiResponse';

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
    // This is simplified for the demo.
    const data = await appointmentService.getAll();
    res.status(200).json(new ApiResponse(200, data, 'Appointments retrieved successfully.'));
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await appointmentService.getById(id);
    if (!data) {
        return res.status(404).json(new ApiResponse(404, null, 'Appointment not found.'));
    }
    res.status(200).json(new ApiResponse(200, data, 'Appointment retrieved successfully.'));
});

// Other methods like create, update, delete are omitted for the demo build fix.