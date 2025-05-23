import { Request, Response, NextFunction } from 'express';
import { BookAppointmentRequestSchema, BookAppointmentRequest, Appointment } from '../types/appointmentTypes';
import * as appointmentService from '../services/appointmentService';
import logger from '../utils/logger';
import { z } from 'zod';

// Extend Express Request type to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    // Add other user properties if populated by your auth middleware
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