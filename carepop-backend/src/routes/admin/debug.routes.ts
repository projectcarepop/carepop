import { Router } from 'express';
import * as debugController from '../../controllers/admin/debug.controller';

const router = Router();

router.get(
    '/test-appointments', 
    debugController.testAppointmentsSearch
);

export default router; 