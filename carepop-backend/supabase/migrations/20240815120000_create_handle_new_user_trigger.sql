-- Define the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to call handle_new_user on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a new profile entry (user_id only) when a user signs up via Supabase Auth.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a new user is created in auth.users, automatically create a corresponding profile stub (user_id only) in public.profiles.';

-- Migration: YYYYMMDDHHMMSS_create_nearby_clinics_function.sql
-- Ensure PostGIS is enabled: CREATE EXTENSION IF NOT EXISTS postgis; (should already be from clinic table migration)

CREATE OR REPLACE FUNCTION nearby_clinics(
    search_lat double precision,
    search_lon double precision,
    search_radius_meters double precision
)
RETURNS SETOF public.clinics -- Returns the full clinic row
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.clinics
    WHERE 
        ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography, -- Assumes your coordinate columns in 'clinics' are 'longitude' and 'latitude'
            ST_MakePoint(search_lon, search_lat)::geography,
            search_radius_meters
        )
        AND is_active = TRUE; -- Only return active clinics
END;
$$;

-- Example Usage (for testing in Supabase SQL editor):
-- SELECT * FROM nearby_clinics(14.5995, 120.9842, 5000); -- (Latitude, Longitude for Manila, 5km radius)