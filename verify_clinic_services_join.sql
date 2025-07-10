-- Diagnostic Query to verify the join between clinics and services.
--
-- INSTRUCTIONS:
-- 1. Replace 'your_clinic_id_here' with the actual UUID of the clinic you are inspecting.
-- 2. Run this query against your database.
--
-- EXPECTED RESULTS:
-- - If the clinic has services assigned in the `clinic_services` table, you will
--   see one row for each assigned service, with clinic and service details filled in.
--
-- - If the clinic has NO services assigned, you will see ONE row with the clinic's
--   ID and name, but the `service_id` and `service_name` columns will be NULL.

SELECT
    c.id as clinic_id,
    c.name as clinic_name,
    s.id as service_id,
    s.name as service_name
FROM
    clinics c
LEFT JOIN
    clinic_services cs ON c.id = cs.clinic_id
LEFT JOIN
    services s ON cs.service_id = s.id
WHERE
    c.id = 'your_clinic_id_here'; 