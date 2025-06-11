import { Router } from 'express';
import { authMiddleware } from '../../lib/middleware/auth.middleware';
import { authorize } from '../../lib/middleware/role.middleware';

const router = Router();

// Apply the authMiddleware to all routes in this file.
// This ensures that only authenticated users can even attempt to access these endpoints.
router.use(authMiddleware);

// Example GET endpoint that is protected and requires the 'Admin' role.
router.get(
    '/',
    authorize(['Admin']), // This middleware checks if the authenticated user has the 'Admin' role.
    (req, res) => {
        // Because of the middleware, we can be certain that req.user exists and has the 'Admin' role.
        const adminUser = req.user;
        res.json({
            message: `Welcome, Admin ${adminUser.profile.first_name}.`,
            data: {
                totalUsers: 1024,
                activeAppointments: 128,
                revenue: 5120.42
            }
        });
    }
);

// Example POST endpoint that requires either 'Admin' or 'Provider' role.
router.post(
    '/generate-report',
    authorize(['Admin', 'Provider']), // Only Admins or Providers can access this
    (req, res) => {
        res.json({
            message: 'Report generation started successfully.',
            requestedBy: req.user.profile.email
        });
    }
);

export default router; 