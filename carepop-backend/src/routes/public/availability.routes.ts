import { Router } from 'express';
import { availabilityController } from '../../controllers/public/availability.controller';
import { authMiddleware } from '../../lib/middleware/auth.middleware';

const router = Router();

// This route should be authenticated as only logged-in users can book appointments.
router.get(
    '/providers/:providerId/availability', 
    authMiddleware, // Ensure user is logged in
    availabilityController.getProviderAvailability
);

export const availabilityRoutes = router; 