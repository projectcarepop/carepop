import express, { Router, RequestHandler } from 'express';
import * as providerController from '../controllers/providerController';
import { authenticateToken } from '../middleware/authMiddleware'; // Assuming auth is needed

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/clinics/{clinicId}/providers:
 *   get:
 *     summary: Retrieve providers for a specific clinic (and optionally service)
 *     description: >
 *       Fetches a list of active providers associated with a given clinic. 
 *       Optionally, a serviceId can be provided to help determine if provider selection is necessary,
 *       though current backend logic primarily lists providers by clinic.
 *     tags:
 *       - Providers
 *       - Clinics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The UUID of the clinic.
 *       - in: query
 *         name: serviceId 
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: The UUID of the service (used to check requires_provider_assignment, future filtering).
 *     responses:
 *       200:
 *         description: A list of providers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object // Define provider schema later
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   specialty_name:
 *                     type: string
 *                     nullable: true
 *                   avatar_url:
 *                     type: string
 *                     nullable: true
 *       400:
 *         description: Invalid Clinic ID or Service ID format.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Clinic not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/clinics/:clinicId/providers', 
    authenticateToken as RequestHandler, // All booking-related APIs should be authenticated
    providerController.listProvidersForClinic as RequestHandler
);

// Add other provider-related routes here if needed

export default router; 