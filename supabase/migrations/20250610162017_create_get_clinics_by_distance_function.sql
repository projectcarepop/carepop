-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
-- Create the topology schema and enable the required extension within it
CREATE SCHEMA IF NOT EXISTS topology;
CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;

-- Function to get clinics by distance from a user's location
CREATE OR REPLACE FUNCTION get_clinics_by_distance(user_lat float, user_lon float)
RETURNS TABLE (
  id uuid,
  name text,
  full_address text,
  street_address text,
  locality text,
  region text,
  postal_code text,
  country_code text,
  latitude double precision,
  longitude double precision,
  contact_phone text,
  contact_email text,
  website_url text,
  operating_hours text,
  fpop_chapter_affiliation text,
  additional_notes text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  distance_km float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.full_address,
    c.street_address,
    c.locality,
    c.region,
    c.postal_code,
    c.country_code,
    c.latitude,
    c.longitude,
    c.contact_phone,
    c.contact_email,
    c.website_url,
    c.operating_hours,
    c.fpop_chapter_affiliation,
    c.additional_notes,
    c.is_active,
    c.created_at,
    c.updated_at,
    -- Calculate distance in kilometers using PostGIS ST_Distance function
    -- The function takes geography points, so we cast the lat/lon
    (ST_Distance(
      ST_MakePoint(c.longitude, c.latitude)::geography,
      ST_MakePoint(user_lon, user_lat)::geography
    ) / 1000)::float AS distance_km
  FROM
    public.clinics c
  WHERE
    c.is_active = true
  ORDER BY
    distance_km;
END;
$$ LANGUAGE plpgsql; 