import { Router } from 'express';
import * as debugController from '../../controllers/admin/debug.controller';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import * as medicalRecordService from '@/services/admin/medical-record.service';
import logger from '@/utils/logger';
import { sendSuccess } from '@/lib/utils/sendSuccess';

const router = Router();

router.get(
    '/test-appointments', 
    debugController.testAppointmentsSearch
);

router.get('/test-medical-records/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info(`[DEBUG] Testing medical records fetch for user ID: ${id}`);
    try {
        const records = await medicalRecordService.getMedicalRecordsByUserId(id, '');
        logger.info(`[DEBUG] Successfully fetched records:`, records);
        sendSuccess(res, { message: 'Debug successful', data: records });
    } catch (error: any) {
        logger.error(`[DEBUG] Error in test-medical-records endpoint: ${error.message}`, {
            stack: error.stack,
            fullError: error
        });
        res.status(500).json({
            message: 'Debug endpoint failed',
            error: error.message,
            stack: error.stack
        });
    }
}));

export default router; 