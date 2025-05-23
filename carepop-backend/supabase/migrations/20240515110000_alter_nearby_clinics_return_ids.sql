-- Migration: Alters the nearby_clinics function to return only clinic IDs.

-- Drop the old function definition if it exists to avoid issues with CREATE OR REPLACE 
-- if the return type signature changes significantly (which it does here from SETOF public.clinics to TABLE(id uuid)).
DROP FUNCTION IF EXISTS public.nearby_clinics(double precision, double precision, double precision);

-- Recreate the function to return a table with a single 'id' column of type uuid.
CREATE OR REPLACE FUNCTION public.nearby_clinics(
    search_lat double precision,
    search_lon double precision,
    search_radius_meters double precision
)
RETURNS TABLE(id uuid) -- Specifies the return type as a table with one column 'id' of type uuid
LANGUAGE plpgsql
STABLE -- Indicates the function cannot modify the database and always produces the same results for the same arguments within a single transaction.
AS $$
BEGIN
    RETURN QUERY
    SELECT public.clinics.id -- Select only the id column
    FROM public.clinics
    WHERE 
        public.clinics.is_active = TRUE -- Only search active clinics
        AND ST_DWithin(
            ST_MakePoint(public.clinics.longitude, public.clinics.latitude)::geography, 
            ST_MakePoint(search_lon, search_lat)::geography,
            search_radius_meters
        );
END;
$$;

COMMENT ON FUNCTION public.nearby_clinics(double precision, double precision, double precision) 
IS 'Searches for active clinics within a given radius (in meters) from a central latitude and longitude. Returns only the IDs of matching clinics. Requires PostGIS.';

-- Example of how to call this function in SQL (for testing in Supabase SQL editor):
-- SELECT id
-- FROM public.nearby_clinics(
--    search_lat := 14.5995,    -- Example: Latitude for Manila
--    search_lon := 120.9842,   -- Example: Longitude for Manila
--    search_radius_meters := 5000 -- Example: 5km radius
-- );