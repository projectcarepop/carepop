import { Request, Response, NextFunction } from 'express';
import {
  BookAppointmentRequestSchema,
  BookAppointmentRequest,
  Appointment,
  CancelAppointmentPathParamsSchema,
  CancelAppointmentRequestBodySchema,
  CancelAppointmentPathParams,
  CancelAppointmentRequestBody,
  CancelledBy // Enum, not a type
} from '../types/appointmentTypes';
import * as appointmentService from '../services/appointmentService';
import logger from '../utils/logger';
import { z } from 'zod';

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
    if (!req.user || !req.user.id) {
      logger.warn('[createAppointmentHandler] User not authenticated or user ID missing.');
      res.status(401).json({ message: 'Authentication required.' });
      return; // Explicitly return void
    }
    const userId = req.user.id;

    const bookingRequest: BookAppointmentRequest = BookAppointmentRequestSchema.parse(req.body);
    logger.info(`[createAppointmentHandler] Validated booking request for user ${userId}:`, bookingRequest);

    const newAppointment: Appointment = await appointmentService.bookAppointment(bookingRequest, userId);

    logger.info(`[createAppointmentHandler] Appointment ${newAppointment.id} created successfully for user ${userId}.`);
    res.status(201).json(newAppointment);
    // No explicit return here, implicitly void

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[createAppointmentHandler] Validation error:', error.issues);
      res.status(400).json({ message: 'Invalid request body', details: error.issues });
      return; // Explicitly return void
    }
    if (error instanceof Error) {
        // Errors from appointmentService (e.g., clinic not active, service not offered)
        // These are treated as client errors (e.g., bad request based on business logic)
        // Log them as info/warn as they are expected application flow errors for invalid inputs.
        logger.warn(`[createAppointmentHandler] Error booking appointment for user ${req.user?.id || 'unknown'}: ${error.message}`);
        res.status(400).json({ message: error.message }); 
        return; // Explicitly return void
    }
    // Fallback for unexpected errors
    logger.error('[createAppointmentHandler] Unexpected error:', error);
    next(error); // Passes control, implicitly void for this path's promise
  }
};

/**
 * Handles the request to cancel an appointment.
 */
export const cancelAppointmentHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      logger.warn('[cancelAppointmentHandler] User not authenticated or user ID missing.');
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }
    const userId = req.user.id;
    const userRoles = req.user.roles || []; // Get roles from token, default to empty array

    const { appointmentId } = CancelAppointmentPathParamsSchema.parse(req.params);
    const requestBody: CancelAppointmentRequestBody = CancelAppointmentRequestBodySchema.parse(req.body);

    logger.info(`[cancelAppointmentHandler] Validated cancellation request for appointment ${appointmentId} by user ${userId}`, requestBody);

    const updatedAppointment: Appointment = await appointmentService.cancelAppointment(
      appointmentId,
      requestBody.cancelledBy, // This is 'user' | 'clinic' from the enum
      requestBody.cancellationReason,
      userId,
      userRoles
    );

    logger.info(`[cancelAppointmentHandler] Appointment ${updatedAppointment.id} cancelled successfully by user ${userId}.`);
    res.status(200).json(updatedAppointment);

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[cancelAppointmentHandler] Validation error:', error.issues);
      res.status(400).json({ message: 'Invalid request parameters or body', details: error.issues });
      return;
    }
    if (error instanceof Error) {
      // Errors from appointmentService (e.g., appointment not found, not authorized)
      logger.warn(`[cancelAppointmentHandler] Error cancelling appointment for user ${req.user?.id || 'unknown'}: ${error.message}`);
      res.status(400).json({ message: error.message });
      return;
    }
    // Fallback for unexpected errors
    logger.error('[cancelAppointmentHandler] Unexpected error:', error);
    next(error);
  }
}; 