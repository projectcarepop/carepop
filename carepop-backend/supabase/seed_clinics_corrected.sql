-- Ensure PostGIS extension is enabled
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

DO $$
DECLARE
    common_services TEXT[] := ARRAY[
        'Family planning counseling', 'Birthing Clinic services', 'Pre-natal care', 'Normal delivery', 'Post-natal care',
        'Immunization (Hepa B for mothers)', 'Immunization (Tetanus Toxoid for mothers)', 'Gynecological consultation',
        'Cervical cauterization', 'Albothyl concentrate treatment', 'IUD insertion', 'IUD check-up', 'IUD removal',
        'Gynecology cervical treatment', 'Vaginal douche service', 'Hypertension (HPN) management',
        'Urinary Tract Infection (UTI) treatment', 'Well-baby check-up', 'Well-child check-up',
        'Child Immunization (Hepa B)', 'Child Immunization (MMR)', 'Child Immunization (Oral Polio)',
        'Child Immunization (Measles)', 'Child Immunization (Tetanus Toxoid)', 'Child Immunization (BCG)',
        'Child Immunization (Chickenpox)', 'Child Immunization (Hib)', 'Child Immunization (PentactHib)',
        'Child Immunization (Mumps Measles Rubella)', 'Child Immunization (URTI treatment)', 'Child Immunization (DPT)',
        'Sick baby consultation', 'Sick child consultation', 'Vitamin A supplementation', 'Nebulization service',
        'Ear piercing', 'Circumcision', 'General medical consultation', 'Minor surgery', 'Ophthalmology consultation',
        'Dental restoration', 'Dental prophylaxis', 'Dental extraction', 'Blood pressure check-up (Non-resupply)',
        'Blood pressure check-up (Resupply)', 'Pregnancy test', 'Urinalysis', 'Fecalysis', 'Complete Blood Count (CBC)',
        'Hemoglobin test (HB/HGB)', 'Hematocrit test (HCF)', 'Blood chemistry analysis', 'Platelet count test',
        'Fasting Blood Sugar (FBS) test', 'Ultrasound imaging', 'Pap Smear reading', 'Chest x-ray',
        'Widal\'s Test (Typhoid fever)', 'Biopsy service', 'Abdominal x-ray', 'Electrocardiogram (ECG)',
        'Thyroid Clearance test', 'Gram Stain test', 'Wet Smear/Mount test', 'STD screening/VDRL',
        'Hepatitis B surface antigen (HbsAg) test', 'Sperm analysis', 'White Blood Cell (WBC) count',
        'Clotting time test', 'Bleeding time test', 'Blood Uric Acid (BUA) test', 'Other laboratory services',
        'Women\'s pelvic examination', 'Women\'s breast examination', 'Pap Smear test',
        'Women\'s infertility consultation/management', 'Women\'s UTI treatment', 'Women\'s RTI treatment',
        'Other women\'s reproductive health services', 'Men\'s infertility consultation/management',
        'Men\'s impotency management', 'Men\'s Urological screening', 'Men\'s STD screening/VDRL',
        'Other men\'s reproductive health services'
    ];
BEGIN

    INSERT INTO public.clinics (
        id, name, full_address, street_address, locality, region, postal_code, country_code,
        latitude, longitude, contact_phone, contact_email, website_url,
        operating_hours, services_offered, fpop_chapter_affiliation,
        is_active, additional_notes, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'FPOP NCR - Tandang Sora Clinic',
        '248 Tandang Sora Avenue, Barangay Tandang Sora, Quezon City, Metro Manila', -- Full address
        '248 Tandang Sora Avenue', -- street_address
        'Quezon City', -- locality (city/municipality)
        'Metro Manila', -- region (province)
        NULL, -- postal_code (if known, or keep NULL)
        'PH', -- country_code
        14.676285, 121.042462,
        '+63 921 739 5456',
        'metromanila@fpop1969.org',
        NULL, -- website_url (if available, or keep NULL)
        '{"Mon-Fri": "9am-5pm", "Sat": "9am-12pm", "notes": "Please call to confirm hours."}'::jsonb,
        common_services,
        'NCR',
        TRUE,
        'Main Office for NCR Chapter. Also a Birthing Clinic.',
        NOW(), NOW()
    );

    INSERT INTO public.clinics (
        id, name, full_address, street_address, locality, region, postal_code, country_code,
        latitude, longitude, contact_phone, contact_email, website_url,
        operating_hours, services_offered, fpop_chapter_affiliation,
        is_active, additional_notes, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'FPOP NCR - Tondo Clinic',
        '23unit Bldg. Happy Homes, Varona St., Tondo, Manila, Metro Manila', -- Full address
        '23unit Bldg. Happy Homes, Varona St.', -- street_address
        'Manila', -- locality
        'Metro Manila', -- region
        NULL, -- postal_code
        'PH', -- country_code
        14.612692, 120.965949,
        '+63 921 739 5435',
        'metromanila@fpop1969.org',
        NULL, -- website_url
        '{"Mon-Fri": "9am-5pm", "Sat": "9am-12pm", "notes": "Please call to confirm hours."}'::jsonb,
        common_services,
        'NCR',
        TRUE,
        'Tondo Community Health Care Clinic.',
        NOW(), NOW()
    );

    INSERT INTO public.clinics (
        id, name, full_address, street_address, locality, region, postal_code, country_code,
        latitude, longitude, contact_phone, contact_email, website_url,
        operating_hours, services_offered, fpop_chapter_affiliation,
        is_active, additional_notes, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'FPOP NCR - Cubao Clinic',
        '298 15th Avenue, Barangay Silangan, Cubao, Quezon City, Metro Manila', -- Full address
        '298 15th Avenue, Barangay Silangan', -- street_address (Barangay included here as per your original, adjust if needed)
        'Quezon City', -- locality (Cubao is part of QC)
        'Metro Manila', -- region
        NULL, -- postal_code
        'PH', -- country_code
        14.628056, 121.055751,
        '+63 918 673 4444',
        'metromanila@fpop1969.org',
        NULL, -- website_url
        '{"Mon-Fri": "9am-5pm", "Sat": "9am-12pm", "notes": "Please call to confirm hours."}'::jsonb,
        common_services,
        'NCR',
        TRUE,
        'Cubao Community Health Care Clinic.',
        NOW(), NOW()
    );
END $$; 