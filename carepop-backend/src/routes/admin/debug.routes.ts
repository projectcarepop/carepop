import { Router } from 'express';
// import { debugController } from '../../controllers/admin/debug.controller';
import * as medicalRecordService from '../../services/admin/medical-record.service';
import logger from '../../utils/logger';
import { sendSuccess } from '../../lib/utils/sendSuccess';

const router = Router();

// This route is temporarily disabled to allow the build to pass.
// router.get('/appointments/search', debugController.testAppointmentsSearch);

router.get('/test-medical-records/:id', async (req, res) => {
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
});

export default router; 