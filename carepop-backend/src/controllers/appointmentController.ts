import { Request, Response, NextFunction } from 'express';
import {
  BookAppointmentRequestSchema,
  BookAppointmentRequest,
  Appointment,
  CancelAppointmentPathParamsSchema,
  CancelAppointmentRequestBodySchema,
  CancelAppointmentPathParams,
  CancelAppointmentRequestBody,
  CancelledBy, // Enum, not a type
  UserAppointmentDetails, // Added for APP-USER-1
  // GetUserAppointmentsResponseSchema, // For response validation if needed, not directly here
} from '../types/appointmentTypes';
import * as appointmentService from '../services/appointmentService';
import logger from '../utils/logger';
import { z } from 'zod';
import { createSupabaseClientWithToken } from '../config/supabaseClient';

// Extend Express Request type to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[]; // Assuming roles might be populated by auth middleware
  };
}

/**
 * Handles the request to book a new appointment.
 */
export const createAppointmentHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || !req.user || !req.user.id) {
      logger.warn('[createAppointmentHandler] User not authenticated, user ID missing, or token missing.');
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }
    const userId = req.user.id;
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) { // Should be caught by the check above, but as an extra safeguard
        logger.warn('[createAppointmentHandler] Access token is missing after Bearer split.');
        res.status(401).json({ message: 'Malformed authentication token.'});
        return;
    }

    const userSupabaseClient = createSupabaseClientWithToken(accessToken);

    const bookingRequest: BookAppointmentRequest = BookAppointmentRequestSchema.parse(req.body);
    logger.info(`[createAppointmentHandler] Validated booking request for user ${userId}:`, bookingRequest);

    const newAppointment: Appointment = await appointmentService.bookAppointment(
      bookingRequest, 
      userId,
      userSupabaseClient
    );

    logger.info(`[createAppointmentHandler] Appointment ${newAppointment.id} created successfully for user ${userId}.`);
    res.status(201).json({ success: true, data: newAppointment, message: 'Appointment created successfully.' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[createAppointmentHandler] Validation error:', error.issues);
      res.status(400).json({ success: false, message: 'Invalid request body', details: error.issues });
      return; // Explicitly return void
    }
    if (error instanceof Error) {
        // Errors from appointmentService (e.g., clinic not active, service not offered)
        // These are treated as client errors (e.g., bad request based on business logic)
        // Log them as info/warn as they are expected application flow errors for invalid inputs.
        logger.warn(`[createAppointmentHandler] Error booking appointment for user ${req.user?.id || 'unknown'}: ${error.message}`);
        res.status(400).json({ success: false, message: error.message }); 
        return; // Explicitly return void
    }
    // Fallback for unexpected errors
    logger.error('[createAppointmentHandler] Unexpected error:', error);
    // For generic server errors, send a generic message
    res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
    // next(error); // Avoid passing to generic error handler if we send a response
  }
};

/**
 * Handles the request to cancel an appointment.
 */
export const cancelAppointmentHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || !req.user || !req.user.id) {
      logger.warn('[cancelAppointmentHandler] User not authenticated, user ID missing, or token missing.');
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    const userId = req.user.id;
    const userRoles = req.user.roles || [];
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
        logger.warn('[cancelAppointmentHandler] Access token is missing after Bearer split.');
        res.status(401).json({ message: 'Malformed authentication token.'});
        return;
    }
    const userSupabaseClient = createSupabaseClientWithToken(accessToken);

    const { appointmentId } = CancelAppointmentPathParamsSchema.parse(req.params);
    const requestBody: CancelAppointmentRequestBody = CancelAppointmentRequestBodySchema.parse(req.body);

    logger.info(`[cancelAppointmentHandler] Validated cancellation request for appointment ${appointmentId} by user ${userId}`, requestBody);

    const updatedAppointment: Appointment = await appointmentService.cancelAppointment(
      appointmentId,
      requestBody.cancelledBy, // This is 'user' | 'clinic' from the enum
      requestBody.cancellationReason,
      userId,
      userRoles,
      userSupabaseClient // Pass the client
    );

    logger.info(`[cancelAppointmentHandler] Appointment ${updatedAppointment.id} cancelled successfully by user ${userId}.`);
    res.status(200).json({ success: true, data: updatedAppointment, message: 'Appointment cancelled successfully.' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[cancelAppointmentHandler] Validation error:', error.issues);
      res.status(400).json({ success: false, message: 'Invalid request parameters or body', details: error.issues });
      return;
    }
    if (error instanceof Error) {
      // Errors from appointmentService (e.g., appointment not found, not authorized)
      logger.warn(`[cancelAppointmentHandler] Error cancelling appointment for user ${req.user?.id || 'unknown'}: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    // Fallback for unexpected errors
    logger.error('[cancelAppointmentHandler] Unexpected error:', error);
    res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
    // next(error);
  }
};

/**
 * Handles the request to fetch the authenticated user's future appointments.
 */
export const getUserFutureAppointmentsHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || !req.user || !req.user.id) {
      logger.warn('[getUserFutureAppointmentsHandler] User not authenticated, user ID missing, or token missing.');
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    const userId = req.user.id;
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
        logger.warn('[getUserFutureAppointmentsHandler] Access token is missing after Bearer split.');
        res.status(401).json({ message: 'Malformed authentication token.'});
        return;
    }
    const userSupabaseClient = createSupabaseClientWithToken(accessToken);

    logger.info(`[getUserFutureAppointmentsHandler] Fetching future appointments for user ${userId}`);

    const futureAppointments: UserAppointmentDetails[] = await appointmentService.getUserFutureAppointments(userId, userSupabaseClient);

    logger.info(`[getUserFutureAppointmentsHandler] Successfully fetched ${futureAppointments.length} future appointments for user ${userId}.`);
    res.status(200).json({ success: true, data: futureAppointments, message: 'Future appointments fetched successfully.' });

  } catch (error) {
    // Errors from appointmentService are already logged there.
    // Here, we just ensure a proper response is sent.
    if (error instanceof Error) {
        logger.warn(`[getUserFutureAppointmentsHandler] Error fetching future appointments for user ${req.user?.id || 'unknown'}: ${error.message}`);
        // Typically, service layer errors like "Failed to fetch..." should translate to a 500 for the client,
        // unless it's a specifically handled client-side error (which isn't the case here).
        res.status(500).json({ success: false, message: 'Failed to retrieve future appointments.' }); 
        return;
    }
    // Fallback for unexpected non-Error objects thrown
    logger.error('[getUserFutureAppointmentsHandler] Unexpected error object:', error);
    res.status(500).json({ success: false, message: 'An unexpected server error occurred while fetching future appointments.' });
    // next(error); // Passes control to the generic error handler
  }
};

/**
 * Handles the request to fetch the authenticated user's past appointments.
 */
export const getUserPastAppointmentsHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || !req.user || !req.user.id) {
      logger.warn('[getUserPastAppointmentsHandler] User not authenticated, user ID missing, or token missing.');
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    const userId = req.user.id;
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
        logger.warn('[getUserPastAppointmentsHandler] Access token is missing after Bearer split.');
        res.status(401).json({ message: 'Malformed authentication token.'});
        return;
    }
    const userSupabaseClient = createSupabaseClientWithToken(accessToken);

    logger.info(`[getUserPastAppointmentsHandler] Fetching past appointments for user ${userId}`);

    const pastAppointments: UserAppointmentDetails[] = await appointmentService.getUserPastAppointments(userId, userSupabaseClient);

    logger.info(`[getUserPastAppointmentsHandler] Successfully fetched ${pastAppointments.length} past appointments for user ${userId}.`);
    res.status(200).json({ success: true, data: pastAppointments, message: 'Past appointments fetched successfully.' });

  } catch (error) {
    if (error instanceof Error) {
        logger.warn(`[getUserPastAppointmentsHandler] Error fetching past appointments for user ${req.user?.id || 'unknown'}: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to retrieve past appointments.' });
        return;
    }
    logger.error('[getUserPastAppointmentsHandler] Unexpected error object:', error);
    res.status(500).json({ success: false, message: 'An unexpected server error occurred while fetching past appointments.' });
    // next(error);
  }
}; 