-- Seed Migration for Clinics and Services
-- This script clears and populates the database with initial data based on the FPOP website.
-- It is designed to be idempotent (re-runnable without causing errors).

-- Step 1: Clear existing data to ensure a clean slate.
-- TRUNCATE is used to efficiently remove all rows and reset identity counters.
-- CASCADE ensures that dependent records in 'clinic_services' are also removed.
TRUNCATE TABLE public.specializations, public.services, public.clinics RESTART IDENTITY CASCADE;

-- Step 2: Use Common Table Expressions (CTEs) to insert data and capture the generated IDs for use in subsequent steps.

-- Insert all Specializations (Service Categories)
WITH seeded_specializations AS (
    INSERT INTO public.specializations (name, description)
    VALUES
        ('Family Planning', 'Counseling and services related to family planning.'),
        ('Maternal Health', 'Care for women during pregnancy, childbirth, and the postpartum period.'),
        ('Child Health', 'Medical services for babies and children.'),
        ('General Medicine', 'General medical consultations and minor surgeries.'),
        ('Dental', 'Dental care services.'),
        ('Laboratory', 'Diagnostic testing services.'),
        ('Reproductive Health', 'Services related to male and female reproductive systems.')
    RETURNING id, name
),

-- Insert all Services, linking them to the Specializations created above using a JOIN in the CTE.
seeded_services AS (
    INSERT INTO public.services (name, price, duration_minutes, specialization_id)
    SELECT
        s.name,
        s.price,
        s.duration_minutes,
        ss.id
    FROM (
        VALUES
            ('Pre-natal Care', 500.00, 30, 'Maternal Health'),
            ('Post-natal Care', 500.00, 30, 'Maternal Health'),
            ('Gynecology Consultation', 600.00, 30, 'Maternal Health'),
            ('IUD Insertion', 1500.00, 45, 'Maternal Health'),
            ('Well-baby/child Check-up', 400.00, 30, 'Child Health'),
            ('Immunization (BCG, Polio, etc.)', 800.00, 15, 'Child Health'),
            ('Circumcision', 2500.00, 60, 'Child Health'),
            ('General Consultation', 500.00, 30, 'General Medicine'),
            ('Minor Surgery', 3000.00, 90, 'General Medicine'),
            ('Dental Restoration', 1000.00, 45, 'Dental'),
            ('Dental Prophylaxis (Cleaning)', 800.00, 60, 'Dental'),
            ('Tooth Extraction', 700.00, 30, 'Dental'),
            ('Pregnancy Test', 150.00, 10, 'Laboratory'),
            ('Complete Blood Count (CBC)', 300.00, 15, 'Laboratory'),
            ('Urinalysis', 100.00, 10, 'Laboratory'),
            ('Pap Smear', 750.00, 20, 'Laboratory'),
            ('Ultrasound', 1200.00, 30, 'Laboratory'),
            ('Pelvic Examination', 600.00, 20, 'Reproductive Health'),
            ('Breast Examination', 400.00, 15, 'Reproductive Health'),
            ('STD/VDRL Screening', 800.00, 20, 'Reproductive Health')
    ) AS s(name, price, duration_minutes, specialization_name)
    JOIN seeded_specializations ss ON ss.name = s.specialization_name
    RETURNING id
),

-- Insert all Clinics
seeded_clinics AS (
    INSERT INTO public.clinics (name, street_address, locality, contact_phone, contact_email, fpop_chapter_affiliation)
    VALUES
        ('FPOP Tandang Sora Chapter', '248 Tandang Sora Avenue, Barangay Tandang Sora', 'Quezon City', '+63 921 739 5456', 'metromanila@fpop1969.org', 'NCR'),
        ('FPOP Tondo Clinic', '23unit Bldg. Happy Homes, Varona St.', 'Tondo, Manila', '+63 921-739-5435', NULL, 'NCR'),
        ('FPOP Cubao Chapter', '298 15th Avenue, Barangay Silangan', 'Cubao, Quezon City', '+63 918 673 4444', NULL, 'NCR')
    RETURNING id
)

-- Step 3: Link all seeded services to all seeded clinics.
-- A CROSS JOIN is used here for simplicity to create a many-to-many relationship,
-- ensuring each clinic offers every seeded service.
INSERT INTO public.clinic_services (clinic_id, service_id)
SELECT
    sc.id AS clinic_id,
    ss.id AS service_id
FROM seeded_clinics sc
CROSS JOIN seeded_services ss; 