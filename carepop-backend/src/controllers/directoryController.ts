import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient'; // Assuming this is your Supabase anon client
import logger from '../utils/logger';
import * as directoryService from '../services/directoryService'; // Import the service

// --- Zod Schemas for Validation ---
const searchClinicsQuerySchema = z.object({
  latitude: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
  longitude: z.preprocess((val) => val ? Number(val) : undefined, z.number().optional()),
  radiusKm: z.preprocess((val) => val ? Number(val) : undefined, z.number().positive().optional()),
  serviceIds: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val.split(',').map(id => id.trim()).filter(id => id && z.string().uuid().safeParse(id).success);
      }
      if (Array.isArray(val)) {
        return val.map(id => String(id).trim()).filter(id => id && z.string().uuid().safeParse(id).success);
      }
      return undefined;
    },
    z.array(z.string().uuid({ message: "Invalid Service ID format in serviceIds array" })).optional()
  ),
  q: z.string().trim().optional(),
  page: z.preprocess(
    (val) => (val === undefined || val === null || val === '' ? undefined : Number(val)), 
    z.number().min(1).default(1).optional()
  ),
  pageSize: z.preprocess(
    (val) => (val === undefined || val === null || val === '' ? undefined : Number(val)), 
    z.number().min(1).max(50).default(10).optional()
  ),
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

export const getAllClinics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Add pagination query params validation if needed (e.g., page, pageSize)
    // For now, fetches all active clinics without explicit pagination from controller
    logger.info('[getAllClinics] Request received to fetch all active clinics');
    
    const clinics = await directoryService.fetchAllActiveClinics();
    
    logger.info(`[getAllClinics] Successfully fetched ${clinics?.length || 0} clinics`);
    res.status(200).json({ 
      data: clinics || [], 
      // If pagination is added in service, include totalCount, page, pageSize here
    });
    return;

  } catch (error) {
    logger.error('[getAllClinics] Unhandled error:', error);
    if (!res.headersSent) {
        next(error); // Pass to global error handler
    }
  }
};

export const searchClinics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const queryParams = searchClinicsQuerySchema.parse(req.query);
    logger.info('[searchClinics] Validated query params:', queryParams);

    let clinicIdsFromProximity: string[] | undefined = undefined;
    let clinicIdsFromServiceFilter: string[] | undefined = undefined;

    // Step 1: Proximity search if lat, lon, and radius are provided
    if (queryParams.latitude !== undefined && queryParams.longitude !== undefined && queryParams.radiusKm !== undefined) {
      logger.info(`[searchClinics] Performing proximity search: lat=${queryParams.latitude}, lon=${queryParams.longitude}, radiusKm=${queryParams.radiusKm}`);
      const { data: nearbyClinicsData, error: rpcError } = await supabase.rpc('nearby_clinics', {
        search_lat: queryParams.latitude,
        search_lon: queryParams.longitude,
        search_radius_meters: queryParams.radiusKm * 1000,
      }).select('id');

      if (rpcError) {
        logger.error('[searchClinics] Supabase RPC nearby_clinics error:', rpcError);
        throw rpcError;
      }
      
      clinicIdsFromProximity = nearbyClinicsData?.map((c: { id: string }) => c.id) || [];
      logger.info(`[searchClinics] Found ${clinicIdsFromProximity.length} clinics from proximity search.`);

      if (clinicIdsFromProximity.length === 0) {
        res.status(200).json({ 
          data: [], 
          totalCount: 0, 
          page: queryParams.page, 
          pageSize: queryParams.pageSize, 
          message: 'No clinics found matching proximity criteria.'
        });
        return;
      }
    }
    
    // Step 2: Service filter if serviceIds are provided
    if (queryParams.serviceIds && queryParams.serviceIds.length > 0) {
      logger.info('[searchClinics] Applying serviceIds filter:', queryParams.serviceIds);
      const { data: serviceFilteredClinics, error: serviceFilterError } = await supabase
        .from('clinic_services')
        .select('clinic_id')
        .in('service_id', queryParams.serviceIds)
        .eq('is_offered', true);

      if (serviceFilterError) {
        logger.error('[searchClinics] Supabase clinic_services query error:', serviceFilterError);
        throw serviceFilterError;
      }

      clinicIdsFromServiceFilter = serviceFilteredClinics?.map((cs: { clinic_id: string }) => cs.clinic_id) || [];
      // Deduplicate clinic IDs from service filter
      clinicIdsFromServiceFilter = [...new Set(clinicIdsFromServiceFilter)];
      logger.info(`[searchClinics] Found ${clinicIdsFromServiceFilter.length} unique clinic IDs from service filter.`);

      if (clinicIdsFromServiceFilter.length === 0) {
        res.status(200).json({ 
          data: [], 
          totalCount: 0, 
          page: queryParams.page, 
          pageSize: queryParams.pageSize, 
          message: 'No clinics found matching service criteria.'
        });
        return;
      }
    }

    // Step 3: Build the main query, combining filters
    let query = supabase
      .from('clinics')
      .select(
        'id, name, full_address, latitude, longitude, contact_phone, services_offered, operating_hours, fpop_chapter_affiliation, is_active',
        { count: 'exact' }
      )
      .eq('is_active', true);

    // Combine IDs from proximity and service filters
    let finalClinicIds: string[] | undefined = undefined;

    if (clinicIdsFromProximity !== undefined && clinicIdsFromServiceFilter !== undefined) {
      // Intersect IDs if both filters applied
      finalClinicIds = clinicIdsFromProximity.filter(id => clinicIdsFromServiceFilter!.includes(id));
    } else if (clinicIdsFromProximity !== undefined) {
      finalClinicIds = clinicIdsFromProximity;
    } else if (clinicIdsFromServiceFilter !== undefined) {
      finalClinicIds = clinicIdsFromServiceFilter;
    }
    
    // Apply combined ID filter if any ID filters were active
    if (finalClinicIds !== undefined) {
      if (finalClinicIds.length > 0) {
        query = query.in('id', finalClinicIds);
      } else {
        // If intersection or a single filter resulted in no IDs, return empty
        res.status(200).json({ data: [], totalCount: 0, page: queryParams.page, pageSize: queryParams.pageSize, message: 'No clinics found after applying all filters.' });
        return;
      }
    }

    // Keyword filter (ILKE for MVP)
    if (queryParams.q && queryParams.q.trim() !== '') {
      const searchTerm = `%${queryParams.q.trim()}%`;
      logger.info(`[searchClinics] Applying keyword filter: ${searchTerm}`);
      query = query.or(`name.ilike.${searchTerm},full_address.ilike.${searchTerm}`);
    }
    
    // Pagination
    const page = queryParams.page || 1;
    const pageSize = queryParams.pageSize || 10;
    const offset = (page - 1) * pageSize;
    logger.info(`[searchClinics] Applying pagination: page=${page}, pageSize=${pageSize}, offset=${offset}`);
    query = query.range(offset, offset + pageSize - 1);

    query = query.order('name', { ascending: true });

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
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    logger.error('[searchClinics] Unhandled error in searchClinics:', error);
    if (!res.headersSent) {
        next(error);
    }
  }
};

export const getClinicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clinicId } = getClinicByIdParamsSchema.parse(req.params);
    logger.info(`[getClinicById] Clinic ID received: ${clinicId}`);

    // To match the Clinic type from the frontend, especially for services_offered and operating_hours,
    // a more complex query or data transformation might be needed here instead of 'select("*")'.
    // For now, keeping it simple, but this will likely need refinement.
    const { data, error } = await supabase
      .from('clinics')
      .select('id, name, full_address, latitude, longitude, contact_phone, contact_email, operating_hours, services_offered, fpop_chapter_affiliation, is_active') 
      .eq('id', clinicId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        logger.warn(`[getClinicById] Clinic not found or not active: ${clinicId}`);
        res.status(404).json({ message: 'Clinic not found or not active' });
        return;
      }
      logger.error('[getClinicById] Supabase error:', error);
      throw error;
    }

    if (!data) { 
      logger.warn(`[getClinicById] Clinic not found or not active (no data): ${clinicId}`);
      res.status(404).json({ message: 'Clinic not found or not active' });
      return;
    }
    // TODO: Transform data if necessary to match frontend Clinic type for services_offered, operating_hours
    res.status(200).json(data);
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('[getClinicById] Validation error:', error.issues);
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    logger.error('[getClinicById] Error:', error);
    if (!res.headersSent) {
        next(error);
    }
  }
};

// Ensure existing Zod schemas are not accidentally removed by the edit
searchClinicsQuerySchema;
getClinicByIdParamsSchema;