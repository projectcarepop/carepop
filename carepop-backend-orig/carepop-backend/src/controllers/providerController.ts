import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as providerService from '../services/providerService'; 
import { RawProviderDataFromDB } from '../services/providerService'; // Import the raw type

// Frontend Provider type (align with carepop-web/src/lib/types/booking.ts -> Provider)
interface ProviderFrontendDTO {
  id: string;
  fullName: string; 
  specialty: string | null; // Matches frontend type which uses 'specialty'
  photoUrl: string | null;  // Matches frontend type which uses 'photoUrl'
  acceptingNewPatients: boolean; // Added to match frontend type
}

const GetProvidersForClinicSchema = z.object({
  params: z.object({
    clinicId: z.string().uuid({ message: 'Invalid Clinic ID format' }),
  }),
  query: z.object({
    serviceId: z.string().uuid({ message: 'Invalid Service ID format' }).optional(), // serviceId is optional in schema, but new service func requires it.
  }),
});

export const listProvidersForClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = GetProvidersForClinicSchema.parse(req);
    const { clinicId } = validatedRequest.params;
    const { serviceId } = validatedRequest.query;

    if (!serviceId) {
        // This case should be handled if services don't require provider assignment (skipped on frontend)
        // Or if the API was called incorrectly for a service that DOES require a provider.
        return res.status(400).json({
            success: false,
            message: "Service ID is required to fetch qualified providers.",
            data: []
        });
    }

    // Call the new service function that requires serviceId
    const rawProviders: RawProviderDataFromDB[] = await providerService.fetchProvidersByClinicAndServiceFromDB(clinicId, serviceId);

    const providerDTOs: ProviderFrontendDTO[] = rawProviders.map((p: RawProviderDataFromDB) => ({
      id: p.id,
      fullName: `${p.first_name} ${p.last_name}`.trim(),
      specialty: p.specialty_name || null,      // Map specialty_name to specialty
      photoUrl: p.avatar_url || null,        // Map avatar_url to photoUrl
      acceptingNewPatients: p.accepting_new_patients === null ? false : p.accepting_new_patients, // Map accepting_new_patients
    }));

    res.status(200).json({
        success: true,
        message: providerDTOs.length > 0 ? 'Providers fetched successfully.' : 'No providers found for the selected criteria.',
        data: providerDTOs
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, // Added
        message: 'Invalid input: ' + error.errors.map(e => e.message).join(', '),
        errors: error.format(),
        data: [] // Added
      });
    }
    console.error('[ProviderController] Error in listProvidersForClinic:', error);
    next(error); 
  }
}; 