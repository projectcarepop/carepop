import { Request, Response } from 'express';
import { asyncHandler } from '../../lib/utils/asyncHandler';
import * as providerService from '../../services/public/provider.service';
import { sendSuccess } from '../../lib/utils/sendSuccess';
import { AppError } from '../../lib/utils/appError';
import { z } from 'zod';

const availabilityQuerySchema = z.object({
    serviceId: z.string().uuid(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // YYYY-MM-DD
});

export const getProviderAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { providerId } = req.params;
    if (!providerId) {
        throw new AppError('Provider ID is required.', 400);
    }

    const queryValidation = availabilityQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
        throw new AppError(`Invalid query parameters: ${queryValidation.error.message}`, 400);
    }
    
    const { serviceId, startDate, endDate } = queryValidation.data;

    const availability = await providerService.calculateProviderAvailability(providerId, serviceId, startDate, endDate);
    
    sendSuccess(res, { data: availability });
});