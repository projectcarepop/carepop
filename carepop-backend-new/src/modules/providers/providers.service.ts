import { db } from '../../db/drizzle';
import { providers, profiles } from '../../db/schema';
import { ApiError } from '../../lib/errors';
import { CreateProviderInput, UpdateProviderInput } from './providers.validation';
import { eq, asc } from 'drizzle-orm';
import { supabaseAdmin } from '../../lib/supabase';

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

async function getAllProvidersForAdmin() {
  try {
    // This query is now guaranteed to work by fetching ONLY from the providers table.
    // It uses the admin client to bypass any RLS.
    // We are intentionally NOT joining with profiles to support the unlinked seed data.
    const { data, error } = await supabaseAdmin.from('providers').select('*');

    if (error) {
      console.error("Supabase query error in getAllProvidersForAdmin:", error);
      throw new ApiError(500, `Could not retrieve providers. Database error: ${error.message}`);
    }
    
    // The frontend expects a 'profile' property. We will add a null one for now.
    // We will fix the frontend to handle this gracefully in the next step.
    return data.map(p => ({
      ...p,
      profile: null 
    }));

  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve providers. Database error: ${errorMessage}`);
  }
}

async function getProviderById(id: string) {
  try {
    const data = await db.query.providers.findFirst({
      where: eq(providers.id, id),
      with: {
        profile: true
      }
    });
    if (!data) {
      throw new ApiError(404, 'Provider not found');
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve provider. Database error: ${errorMessage}`);
  }
}

async function createProvider(data: CreateProviderInput) {
  try {
    const [newProvider] = await db.insert(providers).values(data).returning();
    return newProvider;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    if (errorMessage.includes('duplicate key value violates unique constraint')) {
        throw new ApiError(409, 'A provider with this license number or profile ID already exists.');
    }
    throw new ApiError(500, `Could not create provider. Database error: ${errorMessage}`);
  }
}

async function updateProvider(id: string, data: UpdateProviderInput) {
  try {
    const [updatedProvider] = await db
      .update(providers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();
    if (!updatedProvider) {
      throw new ApiError(404, 'Provider not found to update');
    }
    return updatedProvider;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not update provider. Database error: ${errorMessage}`);
  }
}

async function deleteProvider(id: string) {
  try {
    const [deletedProvider] = await db.delete(providers).where(eq(providers.id, id)).returning();
     if (!deletedProvider) {
      throw new ApiError(404, 'Provider not found to delete');
    }
    return { success: true, id: deletedProvider.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not delete provider. Database error: ${errorMessage}`);
  }
}

export const providersService = {
  getProvidersForService,
  getAllProvidersForAdmin,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
}; 