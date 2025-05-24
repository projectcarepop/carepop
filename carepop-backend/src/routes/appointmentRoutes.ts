import express, { Router } from 'express';
import {
  createAppointmentHandler,
  cancelAppointmentHandler,
  getUserFutureAppointmentsHandler,
  getUserPastAppointmentsHandler
} from '../controllers/appointmentController';
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

/**
 * @openapi
 * /api/v1/appointments/{appointmentId}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     description: >
 *       Marks an appointment as cancelled by either the user or the clinic.
 *       Requires authentication (Bearer token).
 *       User ID and roles are derived from the authentication token for authorization.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the appointment to cancel.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelAppointmentRequestBody'
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid request parameters or body, or business logic error (e.g., appointment not found, appointment already cancelled/completed, encryption error for cancellation reason).
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
 *       403:
 *         description: Forbidden. User not authorized to cancel this appointment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *       404:
 *         description: Appointment not found.
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
router.patch(
  '/:appointmentId/cancel',
  authenticateToken,
  cancelAppointmentHandler
);

/**
 * @openapi
 * /api/v1/appointments/me/future:
 *   get:
 *     summary: Get user's future appointments
 *     description: >
 *       Retrieves a list of the authenticated user's future appointments
 *       (status PENDING or CONFIRMED, and appointment_time in the future).
 *       Includes details of the service, clinic, and provider for each appointment.
 *       Requires authentication (Bearer token).
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of future appointments with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAppointmentDetails'
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
router.get(
  '/me/future', 
  authenticateToken, 
  getUserFutureAppointmentsHandler
);

/**
 * @openapi
 * /api/v1/appointments/me/past:
 *   get:
 *     summary: Get user's past appointments
 *     description: >
 *       Retrieves a list of the authenticated user's past appointments
 *       (e.g., status COMPLETED, CANCELLED_USER, CANCELLED_CLINIC, NO_SHOW 
 *       and appointment_time in the past).
 *       Includes details of the service, clinic, and provider for each appointment.
 *       Results are ordered by appointment_time descending.
 *       Requires authentication (Bearer token).
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of past appointments with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAppointmentDetails'
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
router.get(
  '/me/past',
  authenticateToken,
  getUserPastAppointmentsHandler
);

export default router; 