-- This file contains SQL queries to verify the data fetched for the 
-- "View and Manage Clinic" page in the admin dashboard.
--
-- INSTRUCTIONS:
-- 1. Replace the placeholder 'your_clinic_id_here' with a valid UUID of a clinic 
--    from your database in both Query 1 and Query 2.
-- 2. Run these queries against your PostgreSQL database.
-- 3. The results will show you the exact data structure the backend sends to the frontend.

-- =================================================================================
-- Query 1: Fetches the services associated with a specific clinic.
-- This corresponds to the `clinic.services` array that was causing the `.map()` error.
-- EXPECTATION: This should return a list of services. If a clinic has no services, it should return an empty result.
-- =================================================================================
SELECT
    s.id as service_id,
    s.name as service_name,
    s.price as service_price
FROM
    clinic_services cs
JOIN
    services s ON cs.service_id = s.id
WHERE
    cs.clinic_id = 'your_clinic_id_here';


-- =================================================================================
-- Query 2: Fetches the specific doctor-to-service assignments for a clinic.
-- This corresponds to the `clinic.doctorClinicServices` array that was causing the `.reduce()` error.
-- EXPECTATION: This should return a list of {doctor_id, service_id} pairs. If no doctors are assigned
-- to any services in this clinic, it should return an empty result.
-- =================================================================================
SELECT
    dcs.doctor_id,
    dcs.service_id
FROM
    doctor_clinic_services dcs
WHERE
    dcs.clinic_id = 'your_clinic_id_here';


-- =================================================================================
-- Query 3: Fetches all doctors in the system.
-- This corresponds to the `allDoctors` array in the context.
-- =================================================================================
SELECT 
    id, 
    full_name 
FROM 
    doctors 
ORDER BY 
    full_name ASC;


-- =================================================================================
-- Query 4: Fetches all services in the system.
-- This corresponds to the `allServices` array in the context.
-- =================================================================================
SELECT 
    id, 
    name 
FROM 
    services 
ORDER BY 
    name ASC; 