-- SEED SCRIPT: Link every provider to every service within their assigned clinic.
-- This script ensures that if a clinic offers a service, all providers at that clinic can perform it.

-- Use a Common Table Expression (CTE) to find all desired provider-service pairings.
WITH desired_pairings AS (
  SELECT DISTINCT
    cp.provider_id,
    cs.service_id
  FROM
    clinic_providers AS cp -- Get all providers linked to a clinic
    JOIN clinic_services AS cs ON cp.clinic_id = cs.clinic_id -- Join with services offered by the same clinic
)
-- Insert the pairings into the provider_services table.
INSERT INTO provider_services (provider_id, service_id)
SELECT
  dp.provider_id,
  dp.service_id
FROM
  desired_pairings AS dp
-- Crucially, only insert if the pairing does not already exist to prevent duplicates.
ON CONFLICT (provider_id, service_id) DO NOTHING; 