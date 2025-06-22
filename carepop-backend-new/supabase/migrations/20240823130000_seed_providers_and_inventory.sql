-- Seed Migration for Providers, Suppliers, and Inventory
-- This script clears and populates the database with initial data for development and testing.
-- It is designed to be idempotent (re-runnable without causing errors).

-- Step 1: Truncate existing data to ensure a clean slate.
-- We only truncate our new tables. We assume users/profiles/specializations exist.
TRUNCATE TABLE public.suppliers, public.inventory_items, public.providers, public.provider_availability RESTART IDENTITY CASCADE;

-- Step 2: Seed Suppliers
WITH seeded_suppliers AS (
    INSERT INTO public.suppliers (name, contact_person, contact_email, contact_phone, address)
    VALUES
        ('PharmaSupply Inc.', 'John Pharma', 'contact@pharmasupply.com', '0917-123-4567', '123 Medical Plaza, Manila'),
        ('MedEquip Solutions', 'Jane Medico', 'sales@medequip.ph', '0918-987-6543', '456 Health Tower, Cebu City'),
        ('Wellness Distributors', 'Sam Wellness', 'orders@wellnessdist.com', '0920-555-1212', '789 Wellness Bldg, Davao')
    RETURNING id, name
),

-- Step 3: Seed Inventory Items, linking them to suppliers
seeded_inventory AS (
    INSERT INTO public.inventory_items (name, description, category, unit_of_measurement, reorder_level, supplier_id)
    SELECT
        i.name,
        i.description,
        i.category,
        i.unit,
        i.reorder_level,
        ss.id
    FROM (
        VALUES
            ('Paracetamol 500mg', 'Standard pain reliever and fever reducer.', 'Medication', 'box', 50, 'PharmaSupply Inc.'),
            ('Surgical Masks', 'Box of 50 disposable surgical masks.', 'Medical Supplies', 'box', 100, 'MedEquip Solutions'),
            ('Alcohol Swabs', 'Box of 100 alcohol swabs for disinfection.', 'Medical Supplies', 'box', 100, 'MedEquip Solutions'),
            ('Amoxicillin 250mg', 'Common antibiotic for bacterial infections.', 'Medication', 'box', 40, 'PharmaSupply Inc.'),
            ('Pregnancy Test Kits', 'Single-use pregnancy test kits.', 'Diagnostics', 'piece', 200, 'Wellness Distributors')
    ) AS i(name, description, category, unit, reorder_level, supplier_name)
    JOIN seeded_suppliers ss ON ss.name = i.supplier_name
    RETURNING id, name
),

-- Step 4: Seed Inventory Item Batches
seeded_batches AS (
    INSERT INTO public.inventory_item_batches (item_id, batch_number, quantity_received, current_quantity, unit_cost, manufacturing_date, expiration_date)
    SELECT
        si.id,
        b.batch,
        b.qty,
        b.qty,
        b.cost,
        b.mfg::date,
        b.exp::date
    FROM (
        VALUES
            ('Paracetamol 500mg', 'P202301A', 100, 25.50, '2023-01-15', '2025-01-15'),
            ('Surgical Masks', 'SM202305B', 200, 150.00, '2023-05-20', '2026-05-20'),
            ('Alcohol Swabs', 'AS202303C', 300, 80.75, '2023-03-01', '2025-03-01')
    ) AS b(item_name, batch, qty, cost, mfg, exp)
    JOIN seeded_inventory si ON si.name = b.item_name
    RETURNING id
)

-- Step 5: Create placeholder users/profiles for our providers
-- We will create two providers: Dr. Arriana Cruz and Dr. Ben Soliman
-- NOTE: The passwords are intentionally weak and are for development only.
INSERT INTO auth.users (id, email, encrypted_password, role)
VALUES
    ('c4c4f7f7-8c8c-4e4e-8e8e-c4c4f7f7c4c4', 'arriana.cruz@carepop.dev', crypt('password123', gen_salt('bf')), 'user'),
    ('d5d5e8e8-9d9d-5f5f-9f9f-d5d5e8e8d5d5', 'ben.soliman@carepop.dev', crypt('password123', gen_salt('bf')), 'user'),
    ('a1a1b2b2-3c3c-4d4d-5e5e-a1a1b2b2c3c3', 'maria.santos@carepop.dev', crypt('password123', gen_salt('bf')), 'user'),
    ('b2b2c3c3-4d4d-5e5e-6f6f-b2b2c3c3d4d4', 'david.lee@carepop.dev', crypt('password123', gen_salt('bf')), 'user'),
    ('c3c3d4d4-5e5e-6f6f-7a7a-c3c3d4d4e5e5', 'alex.reyes@carepop.dev', crypt('password123', gen_salt('bf')), 'user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, contact_no)
VALUES
    ('c4c4f7f7-8c8c-4e4e-8e8e-c4c4f7f7c4c4', 'Arriana', 'Cruz', '0917-555-1111'),
    ('d5d5e8e8-9d9d-5f5f-9f9f-d5d5e8e8d5d5', 'Ben', 'Soliman', '0918-555-2222'),
    ('a1a1b2b2-3c3c-4d4d-5e5e-a1a1b2b2c3c3', 'Maria', 'Santos', '0919-555-3333'),
    ('b2b2c3c3-4d4d-5e5e-6f6f-b2b2c3c3d4d4', 'David', 'Lee', '0920-555-4444'),
    ('c3c3d4d4-5e5e-6f6f-7a7a-c3c3d4d4e5e5', 'Alex', 'Reyes', '0921-555-5555')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name; -- Simple update to handle re-runs

-- Insert into user_roles to give them the correct role for access control
INSERT INTO public.user_roles (user_id, role)
VALUES
    ('c4c4f7f7-8c8c-4e4e-8e8e-c4c4f7f7c4c4', 'provider'),
    ('d5d5e8e8-9d9d-5f5f-9f9f-d5d5e8e8d5d5', 'provider'),
    ('a1a1b2b2-3c3c-4d4d-5e5e-a1a1b2b2c3c3', 'provider'),
    ('b2b2c3c3-4d4d-5e5e-6f6f-b2b2c3c3d4d4', 'provider'),
    ('c3c3d4d4-5e5e-6f6f-7a7a-c3c3d4d4e5e5', 'provider')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Create the Provider records linked to the profiles
WITH seeded_providers AS (
    INSERT INTO public.providers (id, license_number, bio, accepting_new_patients)
    VALUES
        ('c4c4f7f7-8c8c-4e4e-8e8e-c4c4f7f7c4c4', 'PR-1234567', 'Dr. Arriana Cruz is a dedicated OB-GYN with over 10 years of experience in maternal and reproductive health.', true),
        ('d5d5e8e8-9d9d-5f5f-9f9f-d5d5e8e8d5d5', 'PR-7654321', 'Dr. Ben Soliman is a family medicine practitioner with a focus on general wellness and pediatrics.', true),
        ('a1a1b2b2-3c3c-4d4d-5e5e-a1a1b2b2c3c3', 'PR-1122334', 'Dr. Maria Santos specializes in dental care, with a focus on preventative and restorative treatments.', true),
        ('b2b2c3c3-4d4d-5e5e-6f6f-b2b2c3c3d4d4', 'PR-4455667', 'Dr. David Lee is an expert in laboratory diagnostics and analysis, ensuring accurate test results.', true),
        ('c3c3d4d4-5e5e-6f6f-7a7a-c3c3d4d4e5e5', 'PR-8899001', 'Nurse Alex Reyes has extensive experience in family planning counseling and general patient care.', false)
    RETURNING id, license_number
),

-- Step 7: Link Providers to Specializations
provider_specs AS (
    INSERT INTO public.provider_specializations (provider_id, specialization_id)
    SELECT
        p.id,
        s.id
    FROM (
        VALUES
            ('PR-1234567', 'Maternal Health'),
            ('PR-1234567', 'Reproductive Health'),
            ('PR-7654321', 'General Medicine'),
            ('PR-7654321', 'Child Health'),
            ('PR-1122334', 'Dental'),
            ('PR-4455667', 'Laboratory'),
            ('PR-8899001', 'Family Planning'),
            ('PR-8899001', 'General Medicine')
    ) AS ps(license, spec_name)
    JOIN seeded_providers p ON p.license_number = ps.license
    JOIN public.specializations s ON s.name = ps.spec_name
)

-- Step 8: Set Provider Availability
INSERT INTO public.provider_availability (provider_id, day_of_week, start_time, end_time)
SELECT
    p.id,
    pa.day_of_week,
    pa.start_time::time,
    pa.end_time::time
FROM (
    VALUES
        ('PR-1234567', 'Monday', '09:00:00', '17:00:00'),
        ('PR-1234567', 'Wednesday', '09:00:00', '17:00:00'),
        ('PR-1234567', 'Friday', '09:00:00', '13:00:00'),
        ('PR-7654321', 'Tuesday', '10:00:00', '18:00:00'),
        ('PR-7654321', 'Thursday', '10:00:00', '18:00:00'),
        ('PR-1122334', 'Tuesday', '13:00:00', '17:00:00'),
        ('PR-1122334', 'Thursday', '13:00:00', '17:00:00'),
        ('PR-4455667', 'Monday', '08:00:00', '12:00:00'),
        ('PR-4455667', 'Wednesday', '08:00:00', '12:00:00'),
        ('PR-8899001', 'Friday', '13:00:00', '17:00:00')
) AS pa(license, day_of_week, start_time, end_time)
JOIN seeded_providers p ON p.license_number = pa.license; 