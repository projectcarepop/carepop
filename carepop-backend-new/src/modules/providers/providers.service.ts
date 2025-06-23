import { db } from '../../db/drizzle';
import { ApiError } from '../../lib/errors';
import { and } from 'drizzle-orm';

async function getProvidersForService(clinicId: string, serviceId: string) {
  try {
    // This is a complex query. We need to find providers linked to a clinic AND linked to a service.
    // Drizzle doesn't have a direct "find intersection" query, so we'll fetch two lists and find the common providers.

    // 1. Get all provider IDs for the given clinic
    const clinicProviders = await db.query.clinicProviders.findMany({
      where: (clinicProviders, { eq }) => eq(clinicProviders.clinicId, clinicId),
      columns: { providerId: true },
    });
    const providerIdsForClinic = new Set(clinicProviders.map(p => p.providerId));

    if (providerIdsForClinic.size === 0) {
      return []; // No providers at this clinic, so no need to continue.
    }

    // 2. Get all providers for the given service who are also in the clinic's list of providers
    const providers = await db.query.providerServices.findMany({
      where: (providerServices, { eq, and, inArray }) => and(
        eq(providerServices.serviceId, serviceId),
        inArray(providerServices.providerId, Array.from(providerIdsForClinic))
      ),
      with: {
        provider: {
          with: {
            profile: true,
          }
        }
      },
    });

    console.log(`[Providers Service] Found ${providers.length} provider records for service ${serviceId} at clinic ${clinicId}.`);

    return providers.map(p => p.provider);
  } catch (error) {
    console.error(`Error fetching providers for service ${serviceId} at clinic ${clinicId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve providers. Database error: ${errorMessage}`);
  }
}

export const providersService = {
  getProvidersForService,
}; 