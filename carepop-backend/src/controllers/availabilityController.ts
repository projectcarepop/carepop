import { Request, Response, NextFunction } from 'express';
import * as availabilityService from '../services/availabilityService';
import logger from '../utils/logger';
import {
    GetProviderAvailabilityPathParamsSchema,
    GetProviderAvailabilityQuerySchema,
    GetProviderAvailabilityPathParams,
    GetProviderAvailabilityQuery
} from '../types/availabilityTypes';
import { z } from 'zod';

interface AuthenticatedRequest extends Request { // Or just Request if endpoint is public
    user?: { id: string; };
}

export const getProviderAvailabilityHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validate path parameters
        let pathParams: GetProviderAvailabilityPathParams;
        try {
            pathParams = GetProviderAvailabilityPathParamsSchema.parse(req.params);
        } catch (e) {
            if (e instanceof z.ZodError) {
                logger.warn('[getProviderAvailabilityHandler] Invalid path parameters', { errors: e.formErrors.fieldErrors });
                res.status(400).json({ message: 'Invalid path parameters', errors: e.formErrors.fieldErrors });
                return;
            }
            throw e; // Should not happen often if schema is correct
        }
        const { providerId } = pathParams;

        // Validate query parameters
        let queryParams: GetProviderAvailabilityQuery;
        try {
            queryParams = GetProviderAvailabilityQuerySchema.parse(req.query);
        } catch (e) {
            if (e instanceof z.ZodError) {
                logger.warn('[getProviderAvailabilityHandler] Invalid query parameters', { errors: e.formErrors.fieldErrors });
                res.status(400).json({ message: 'Invalid query parameters', errors: e.formErrors.fieldErrors });
                return;
            }
            throw e;
        }

        // Basic date range validation (e.g., startDate <= endDate, range not too large)
        if (new Date(queryParams.startDate) > new Date(queryParams.endDate)) {
            logger.warn('[getProviderAvailabilityHandler] startDate cannot be after endDate');
            res.status(400).json({ message: 'startDate cannot be after endDate' });
            return;
        }
        // Add more range checks if needed (e.g., max 30 days)

        logger.info(`[getProviderAvailabilityHandler] Request for provider ${providerId} with params: ${JSON.stringify(queryParams)}`);

        const availability = await availabilityService.getProviderAvailability(providerId, queryParams);

        if (!availability || availability.length === 0) {
            res.status(200).json([]); // Return 200 with empty array if no slots, not 404
            return;
        }

        res.status(200).json(availability);

    } catch (error: any) {
        logger.error(`[getProviderAvailabilityHandler] Error fetching provider availability: ${error.message}`, { error });
        if (error.message === 'Service not found or service duration not defined.') {
            res.status(404).json({ message: error.message });
        } else if (error.message.startsWith('Could not fetch')) {
            res.status(500).json({ message: 'Error retrieving provider schedule information.' });
        }
        else {
            // Pass to generic error handler or return 500
            next(error);
        }
    }
}; 