import express, { Router } from 'express';
import { getProviderAvailabilityHandler } from '../controllers/availabilityController';

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/providers/{providerId}/availability:
 *   get:
 *     summary: Get provider's available appointment slots
 *     description: >
 *       Retrieves a list of available time slots for a specified provider, 
 *       clinic, service, and date range.
 *     tags:
 *       - Availability
 *       - Providers
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: ID of the provider whose availability is being queried.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: clinicId
 *         required: true
 *         description: ID of the clinic where the service will be provided.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: serviceId
 *         required: true
 *         description: ID of the service for which availability is being checked (to determine duration).
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: The start date of the range to check for availability (YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: The end date of the range to check for availability (YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Successfully retrieved availability slots.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProviderAvailabilityResponseSlot'
 *       400:
 *         description: Invalid request parameters (e.g., invalid UUID, date format, or date range).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *       404:
 *         description: Service not found or service duration not defined.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or error retrieving provider schedule information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/provider/:providerId/slots', getProviderAvailabilityHandler as express.RequestHandler);

export default router; 