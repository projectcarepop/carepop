-- Migration: 0014_seed_specializations_and_providers.sql
-- Description: This comprehensive script seeds the database with specializations (as service categories),
-- detailed provider data, and links them together to ensure each specialization
-- has at least two providers assigned.

DO $$
DECLARE
    -- Declare variables to hold the IDs of the newly created specializations.
    spec_id_general_consultation UUID;
    spec_id_ob_gyn UUID;
    spec_id_pediatrics UUID;
    spec_id_lgbtq_health UUID;
    spec_id_mental_health UUID;

    -- Declare variables for the new provider IDs.
    prov_id_cruz UUID;
    prov_id_reyes UUID;
    prov_id_santos UUID;
    prov_id_garcia UUID;
    prov_id_lim UUID;
    prov_id_tan UUID;
BEGIN
    -- Step 1: Insert the core specializations into the `service_categories` table.
    INSERT INTO public.service_categories (name, description) VALUES
        ('General Consultation', 'General health check-ups and primary care services.')
    RETURNING id INTO spec_id_general_consultation;

    INSERT INTO public.service_categories (name, description) VALUES
        ('OB-GYN', 'Specialized care in obstetrics and gynecology, including reproductive and prenatal health.')
    RETURNING id INTO spec_id_ob_gyn;

    INSERT INTO public.service_categories (name, description) VALUES
        ('Pediatrics', 'Comprehensive health care for infants, children, and adolescents.')
    RETURNING id INTO spec_id_pediatrics;

    INSERT INTO public.service_categories (name, description) VALUES
        ('LGBTQ+ Health', 'Inclusive and affirming healthcare services for the LGBTQ+ community.')
    RETURNING id INTO spec_id_lgbtq_health;

    INSERT INTO public.service_categories (name, description) VALUES
        ('Mental Health Support', 'Counseling and support services for mental and emotional well-being.')
    RETURNING id INTO spec_id_mental_health;


    -- Step 2: Insert a new set of detailed, self-contained providers.
    INSERT INTO public.providers (full_name, email, phone_number, avatar_url, license_number, bio, is_accepting_patients) VALUES
        ('Isabella Cruz', 'isabella.cruz@example.com', '09171234567', 'https://i.pravatar.cc/150?u=isabella.cruz', 'PTR-0012345', 'Dr. Isabella Cruz is a board-certified OB-GYN with over 10 years of experience.', TRUE),
        ('Miguel Reyes', 'miguel.reyes@example.com', '09287654321', 'https://i.pravatar.cc/150?u=miguel.reyes', 'PTR-0054321', 'Dr. Miguel Reyes specializes in LGBTQ+ health and wellness, offering compassionate care.', TRUE),
        ('Sofia Santos', 'sofia.santos@example.com', '09998887766', 'https://i.pravatar.cc/150?u=sofia.santos', 'PTR-0098765', 'Dr. Sofia Santos is a pediatrician with a focus on developmental health.', FALSE),
        ('David Garcia', 'david.garcia@example.com', '09181112233', 'https://i.pravatar.cc/150?u=david.garcia', 'PTR-0024680', 'Dr. David Garcia provides general consultations and is an expert in mental health support.', TRUE),
        ('Jasmine Lim', 'jasmine.lim@example.com', '09202223344', 'https://i.pravatar.cc/150?u=jasmine.lim', 'PTR-0013579', 'Dr. Jasmine Lim is an OB-GYN who also provides affirming care for the LGBTQ+ community.', TRUE),
        ('Ken Tan', 'ken.tan@example.com', '09393334455', 'https://i.pravatar.cc/150?u=ken.tan', 'PTR-0011223', 'Dr. Ken Tan is a family doctor with a passion for pediatric care and general wellness.', TRUE)
    RETURNING id, id, id, id, id, id INTO prov_id_cruz, prov_id_reyes, prov_id_santos, prov_id_garcia, prov_id_lim, prov_id_tan;


    -- Step 3: Link the providers to their specializations.
    -- This ensures each specialization has at least two providers.
    INSERT INTO public.provider_specializations (provider_id, specialization_id) VALUES
        -- General Consultation
        (prov_id_garcia, spec_id_general_consultation),
        (prov_id_tan, spec_id_general_consultation),

        -- OB-GYN
        (prov_id_cruz, spec_id_ob_gyn),
        (prov_id_lim, spec_id_ob_gyn),

        -- Pediatrics
        (prov_id_santos, spec_id_pediatrics),
        (prov_id_tan, spec_id_pediatrics),

        -- LGBTQ+ Health
        (prov_id_reyes, spec_id_lgbtq_health),
        (prov_id_lim, spec_id_lgbtq_health),

        -- Mental Health Support
        (prov_id_garcia, spec_id_mental_health),
        (prov_id_reyes, spec_id_mental_health);

END $$; 