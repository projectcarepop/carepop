import { Request, Response } from 'express';
import { asyncHandler } from '../../lib/utils/asyncHandler';
import { getProviderAvailability } from '../../services/public/availability.service';
import { z } from 'zod';
import { AppError } from '../../lib/utils/appError';

const GetAvailabilitySchema = z.object({
  params: z.object({
    providerId: z.string().uuid(),
  }),
  query: z.object({
    serviceId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  })
});

const handleGetProviderAvailability = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = GetAvailabilitySchema.safeParse({
    params: req.params,
    query: req.query,
  });

  if (!validationResult.success) {
    throw new AppError(`Invalid parameters: ${validationResult.error.flatten().fieldErrors}`, 400);
  }

  const { params: { providerId }, query: { serviceId, date } } = validationResult.data;

  const availableSlots = await getProviderAvailability(providerId, serviceId, date);

  res.status(200).json({
    status: 'success',
    message: 'Provider availability retrieved successfully.',
    data: availableSlots,
  });
});

export const availabilityController = {
  getProviderAvailability: handleGetProviderAvailability,
}; 