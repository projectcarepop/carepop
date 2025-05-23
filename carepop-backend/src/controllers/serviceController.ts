import { Request, Response, NextFunction } from 'express';
import {
  GetServicesQuerySchema,
  GetServicesQuery,
  GetClinicServicesPathParamsSchema,
  GetClinicServicesPathParams
} from '../types/serviceTypes';
import * as serviceService from '../services/serviceService';

/**
 * Handles the request to get a list of active services.
 * Validates query parameters and calls the service layer.
 */
export const listActiveServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate query parameters
    const validatedQuery: GetServicesQuery = GetServicesQuerySchema.parse(req.query);

    const services = await serviceService.getActiveServices(validatedQuery);
    res.status(200).json(services);
  } catch (error) {
    // Pass to error handling middleware (if you have one)
    // For Zod errors, you might want to send a 400 status
    if (error instanceof Error && error.name === 'ZodError') {
      // Type guard for ZodError if you import z from 'zod'
      // Or check if (error.errors) which is typical for ZodError
      // For now, a generic approach:
      return res.status(400).json({ message: 'Invalid query parameters', details: (error as any).errors });
    }
    // For other errors from the service layer
    console.error('Error in listActiveServices controller:', error);
    // Pass to a generic error handler if available, otherwise send 500
    next(error); 
  }
};

/**
 * Handles the request to get a list of active services for a specific clinic.
 * Validates path parameters and calls the service layer.
 */
export const listServicesForClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate path parameters
    const validatedPathParams: GetClinicServicesPathParams = GetClinicServicesPathParamsSchema.parse(req.params);
    const { clinicId } = validatedPathParams;

    const services = await serviceService.getServicesForClinic(clinicId);
    
    // Could add a check here if services array is empty and clinic itself doesn't exist, 
    // then return 404, but for now, an empty array is acceptable if clinic exists but has no services offered.
    res.status(200).json(services);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid clinic ID format', details: (error as any).errors });
    }
    // Check for specific error messages from service if needed, e.g., clinic not found
    console.error('Error in listServicesForClinic controller:', error);
    next(error); 
  }
}; 