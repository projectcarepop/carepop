import express, { Router, RequestHandler } from 'express';
import * as serviceController from '../controllers/serviceController';

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/services:
 *   get:
 *     summary: Retrieve a list of active services
 *     description: Fetches a list of all active services. Can be filtered by category.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Category to filter services by.
 *     responses:
 *       200:
 *         description: A list of services.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service' # Assuming you have OpenAPI schemas defined elsewhere or will define it
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/services', serviceController.listActiveServices as RequestHandler);

/**
 * @openapi
 * /api/v1/clinics/{clinicId}/services:
 *   get:
 *     summary: Retrieve services offered by a specific clinic
 *     description: Fetches a list of active services offered by a specific clinic, including clinic-specific pricing if available.
 *     tags:
 *       - Services
 *       - Clinics
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The UUID of the clinic.
 *     responses:
 *       200:
 *         description: A list of services offered by the clinic.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClinicService' # Assuming you define ClinicService schema for OpenAPI
 *       400:
 *         description: Invalid Clinic ID format
 *       404:
 *         description: Clinic not found (or no services offered - depending on implementation)
 *       500:
 *         description: Internal server error
 */
router.get('/clinics/:clinicId/services', serviceController.listServicesForClinic as RequestHandler);

export default router; 