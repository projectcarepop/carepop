import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { IAppointmentReport } from '@/types/appointment-report.interface';
import * as reportService from '@/services/admin/appointment.service';
import { AuthenticatedRequest } from '@/types/authenticated-request.interface';
import { supabase } from '@/config/supabaseClient';

export const getReportByAppointmentId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { appointmentId } = req.params;
    const report = await reportService.findReportByAppointmentId(appointmentId, supabase);

    if (!report) {
        return res.status(200).json(new ApiResponse(200, null, 'No report found for this appointment.'));
    }

    res.status(200).json(new ApiResponse(200, report, 'Report retrieved successfully.'));
});

export const createOrUpdateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const reportData: Partial<IAppointmentReport> = req.body;
    
    if (!reportData.appointment_id) {
        return res.status(400).json(new ApiResponse(400, null, 'Appointment ID is required to save a report.'));
    }

    const adminId = req.user?.id;
    if (!adminId) {
        return res.status(401).json(new ApiResponse(401, null, 'Unauthorized: Admin user ID is missing.'));
    }

    const result = await reportService.upsertAppointmentReport(reportData, adminId, supabase);
    res.status(201).json(new ApiResponse(201, result, 'Report saved successfully.'));
}); 