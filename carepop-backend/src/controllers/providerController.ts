import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as providerService from '../services/providerService'; // This service will be created next

const GetProvidersForClinicSchema = z.object({
  params: z.object({
    clinicId: z.string().uuid({ message: 'Invalid Clinic ID format' }),
  }),
  query: z.object({
    serviceId: z.string().uuid({ message: 'Invalid Service ID format' }).optional(),
  }),
});

// Placeholder type - will be refined when providerService is implemented
interface RawProviderData {
    id: string;
    first_name: string;
    last_name: string;
    specialty_name?: string | null;
    avatar_url?: string | null;
}

interface ProviderDTO {
  id: string;
  name: string; // Combination of first_name and last_name
  specialty_name: string | null;
  avatar_url: string | null;
}

export const listProvidersForClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = GetProvidersForClinicSchema.parse(req);
    const { clinicId } = validatedRequest.params;
    // const { serviceId } = validatedRequest.query; // serviceId not used in query yet, but validated

    const providers: RawProviderData[] = await providerService.fetchProvidersByClinic(clinicId);

    const providerDTOs: ProviderDTO[] = providers.map((p: RawProviderData) => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`.trim(),
      specialty_name: p.specialty_name || null,
      avatar_url: p.avatar_url || null,
    }));

    res.status(200).json(providerDTOs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Simplified error handling for Zod validation errors
      return res.status(400).json({ 
        message: 'Invalid input: ' + error.errors.map(e => e.message).join(', '),
        errors: error.format(),
      });
    }
    // Forward other errors to the global error handler (if one exists)
    next(error); 
  }
}; 