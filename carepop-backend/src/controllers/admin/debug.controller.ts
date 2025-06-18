import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/authenticated-request.interface';
import { AppointmentAdminService } from '@/services/admin/appointment.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHandler';

const appointmentService = new AppointmentAdminService();

// A hardcoded user ID from the logs for direct testing.
const TEST_USER_ID = '99e5d265-6943-4f59-bd3d-e5738bacd2a6';

export const testAppointmentsSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log(`[DEBUG] Forcibly testing search_appointments for user: ${TEST_USER_ID}`);
  try {
    const results = await appointmentService.findAll({ userId: TEST_USER_ID });
    console.log('[DEBUG] Test of search_appointments succeeded.');
    sendSuccess(res, { message: 'Debug search successful.', data: results });
  } catch (error) {
    console.error('[DEBUG] Test of search_appointments failed:', error);
    // Re-throw the error to be handled by the global error middleware
    throw error;
  }
}); 