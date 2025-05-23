import express, { Router } from 'express';
import { createAppointmentHandler } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/appointments:
 *   post:
 *     summary: Book a new appointment
 *     description: >
 *       Creates a new appointment for the authenticated user.
 *       Requires authentication (Bearer token).
 *       The user ID is derived from the authentication token.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookAppointmentRequest' 
 *     responses:
 *       201:
 *         description: Appointment booked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid request body or business logic error (e.g., clinic not active, service not offered).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/', 
  authenticateToken, 
  createAppointmentHandler
);

export default router; 