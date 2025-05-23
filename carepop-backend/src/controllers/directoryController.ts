import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient'; // Assuming this is your Supabase anon client
import logger from '../utils/logger';

// --- Zod Schemas for Validation ---
const searchClinicsQuerySchema = z.object({
  latitude: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
  longitude: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
  radiusKm: z.preprocess((val) => val ? Number(val) : undefined, z.number().positive().optional()),
  services: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') return [val.trim()];
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(s => s !== '');
    return undefined;
  }, z.array(z.string()).optional()),
  q: z.string().trim().optional(),
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1).optional()),
  pageSize: z.preprocess((val) => Number(val), z.number().min(1).max(50).default(10).optional()),
}).refine(data => {
  const hasLat = data.latitude !== undefined;
  const hasLon = data.longitude !== undefined;
  const hasRadius = data.radiusKm !== undefined;
  return (hasLat && hasLon && hasRadius) || (!hasLat && !hasLon && !hasRadius);
}, {
  message: 'If one of latitude, longitude, or radiusKm is provided, all three must be provided and be valid numbers.',
  path: ['latitude', 'longitude', 'radiusKm'],
});

const getClinicByIdParamsSchema = z.object({
  clinicId: z.string().uuid(),
});

// --- Controller Functions ---

export const searchClinics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParams = searchClinicsQuerySchema.parse(req.query);
    logger.info('[searchClinics] Validated query params:', queryParams);

    let clinicIdsFromProximity: string[] | undefined = undefined;

    // Step 1: Proximity search if lat, lon, and radius are provided
    if (queryParams.latitude !== undefined && queryParams.longitude !== undefined && queryParams.radiusKm !== undefined) {
      logger.info(`[searchClinics] Performing proximity search: lat=${queryParams.latitude}, lon=${queryParams.longitude}, radiusKm=${queryParams.radiusKm}`);
      const { data: nearbyClinicsData, error: rpcError } = await supabase.rpc('nearby_clinics', {
        search_lat: queryParams.latitude,
        search_lon: queryParams.longitude,
        search_radius_meters: queryParams.radiusKm * 1000,
      }).select('id'); // Assuming nearby_clinics can return just IDs

      if (rpcError) {
        logger.error('[searchClinics] Supabase RPC nearby_clinics error:', rpcError);
        throw rpcError;
      }
      
      clinicIdsFromProximity = nearbyClinicsData?.map((c: { id: string }) => c.id) || [];
      logger.info(`[searchClinics] Found ${clinicIdsFromProximity.length} clinics from proximity search.`);

      if (clinicIdsFromProximity.length === 0) {
        return res.status(200).json({ 
          data: [], 
          totalCount: 0, 
          page: queryParams.page, 
          pageSize: queryParams.pageSize, 
          message: 'No clinics found matching proximity criteria.'
        });
      }
    }

    // Step 2: Build the main query
    let query = supabase
      .from('clinics')
      .select(
        'id, name, full_address, latitude, longitude, contact_phone, services_offered, operating_hours, fpop_chapter_affiliation',
        { count: 'exact' } // For total count based on filters
      )
      .eq('is_active', true);

    // Filter by IDs from proximity search if available
    if (clinicIdsFromProximity !== undefined) {
      if (clinicIdsFromProximity.length > 0) {
        query = query.in('id', clinicIdsFromProximity);
      } else {
        // This case should be handled above, but as a safeguard:
        return res.status(200).json({ data: [], totalCount: 0, page: queryParams.page, pageSize: queryParams.pageSize, message: 'No clinics found after proximity filter.' });
      }
    }

    // Service filter
    if (queryParams.services && queryParams.services.length > 0) {
      logger.info('[searchClinics] Applying services filter:', queryParams.services);
      query = query.overlaps('services_offered', queryParams.services);
    }

    // Keyword filter (ILKE for MVP)
    if (queryParams.q && queryParams.q.trim() !== '') {
      const searchTerm = `%${queryParams.q.trim()}%`;
      logger.info(`[searchClinics] Applying keyword filter: ${searchTerm}`);
      query = query.or(`name.ilike.${searchTerm},full_address.ilike.${searchTerm}`);
      // Consider adding other relevant text fields to the .or() condition if needed
    }
    
    // Pagination
    const page = queryParams.page || 1;
    const pageSize = queryParams.pageSize || 10;
    const offset = (page - 1) * pageSize;
    logger.info(`[searchClinics] Applying pagination: page=${page}, pageSize=${pageSize}, offset=${offset}`);
    query = query.range(offset, offset + pageSize - 1);

    // Order by name for consistent results (optional)
    query = query.order('name', { ascending: true });

    // Execute the main query
    logger.info('[searchClinics] Executing main Supabase query...');
    const { data: clinics, error: queryError, count } = await query;

    if (queryError) {
      logger.error('[searchClinics] Supabase main query error:', queryError);
      throw queryError;
    }

    logger.info(`[searchClinics] Successfully fetched ${clinics?.length || 0} clinics, totalCount: ${count}`);
    res.status(200).json({ 
      data: clinics || [], 
      totalCount: count ?? 0, 
      page,
      pageSize 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[searchClinics] Validation error:', error.issues);
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    logger.error('[searchClinics] Unhandled error in searchClinics:', error);
    // Ensure that next is called for other errors to reach the global error handler
    if (!res.headersSent) {
        next(error);
    }
  }
};

export const getClinicById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clinicId } = getClinicByIdParamsSchema.parse(req.params);
    logger.info(`[getClinicById] Clinic ID received: ${clinicId}`);

    const { data, error } = await supabase
      .from('clinics')
      .select('*') // Select all columns for detail view
      .eq('id', clinicId)
      .eq('is_active', true)
      .single();

    if (error) {
      // Check if the error is due to no rows found, which .single() treats as an error
      if (error.code === 'PGRST116') { // PostgREST code for "Fetched single row, but no rows returned"
        logger.warn(`[getClinicById] Clinic not found or not active: ${clinicId}`);
        return res.status(404).json({ message: 'Clinic not found or not active' });
      }
      logger.error('[getClinicById] Supabase error:', error);
      throw error; // Throw to be caught by the outer try-catch and handled by next(error)
    }

    if (!data) { // Should be redundant due to .single() error handling but good for safety
      logger.warn(`[getClinicById] Clinic not found or not active (no data): ${clinicId}`);
      return res.status(404).json({ message: 'Clinic not found or not active' });
    }

    res.status(200).json(data);

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[getClinicById] Validation error:', error.issues);
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    logger.error('[getClinicById] Error:', error);
    if (!res.headersSent) {
        next(error);
    }
  }
}; 