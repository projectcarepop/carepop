-- Migration: Creates the nearby_clinics function for proximity searches
-- Make sure PostGIS is enabled (it should be if your clinics table uses geography types)
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE OR REPLACE FUNCTION public.nearby_clinics(
    search_lat double precision,
    search_lon double precision,
    search_radius_meters double precision
)
RETURNS SETOF public.clinics -- This means the function returns rows matching the 'clinics' table structure
LANGUAGE plpgsql
STABLE -- Indicates the function cannot modify the database and always produces the same results for the same arguments within a single transaction.
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.clinics
    WHERE 
        public.clinics.is_active = TRUE -- Only search active clinics
        AND ST_DWithin(
            -- Ensure 'longitude' and 'latitude' are the correct column names in your 'clinics' table
            -- and that they store WGS84 geographic coordinates.
            ST_MakePoint(public.clinics.longitude, public.clinics.latitude)::geography, 
            ST_MakePoint(search_lon, search_lat)::geography,
            search_radius_meters
        );
END;
$$;

COMMENT ON FUNCTION public.nearby_clinics(double precision, double precision, double precision) 
IS 'Searches for active clinics within a given radius (in meters) from a central latitude and longitude. Requires PostGIS.';

-- Example of how to call this function in SQL (for testing in Supabase SQL editor):
-- SELECT id, name, full_address
-- FROM public.nearby_clinics(
--    search_lat := 14.5995,    -- Example: Latitude for Manila
--    search_lon := 120.9842,   -- Example: Longitude for Manila
--    search_radius_meters := 5000 -- Example: 5km radius
-- );