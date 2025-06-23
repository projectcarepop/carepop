-- 0012_seed_detailed_providers.sql

-- This script seeds the database with detailed, self-contained provider data.
-- It inserts directly into the `providers` table, which no longer links to `profiles`.

INSERT INTO public.providers (first_name, last_name, email, phone_number, avatar_url, license_number, bio, is_accepting_patients)
VALUES
    (
        'Isabella',
        'Cruz',
        'isabella.cruz@example.com',
        '09171234567',
        'https://i.pravatar.cc/150?u=isabella.cruz',
        'PTR-0012345',
        'Dr. Isabella Cruz is a board-certified OB-GYN with over 10 years of experience in reproductive health and prenatal care. She is a strong advocate for patient education and empowerment.',
        TRUE
    ),
    (
        'Miguel',
        'Reyes',
        'miguel.reyes@example.com',
        '09287654321',
        'https://i.pravatar.cc/150?u=miguel.reyes',
        'PTR-0054321',
        'Dr. Miguel Reyes specializes in LGBTQ+ health and wellness, offering compassionate and inclusive primary care services. He has a focus on mental health integration and holistic well-being.',
        TRUE
    ),
    (
        'Sofia',
        'Santos',
        'sofia.santos@example.com',
        '09998887766',
        'https://i.pravatar.cc/150?u=sofia.santos',
        'PTR-0098765',
        'Dr. Sofia Santos is a pediatrician and adolescent health specialist. She is dedicated to providing comprehensive care for young people, with a special interest in developmental health.',
        FALSE
    ),
    (
        'Admin-Managed',
        'Provider',
        'unlinked.provider@example.com',
        '09000000000',
        'https://i.pravatar.cc/150?u=unlinked.provider',
        'UNLINKED-001',
        'This provider is a seed record to demonstrate a provider managed entirely within the admin panel.',
        false
    );

-- Note: To create unlinked providers for testing the "Link Provider" feature,
-- you can insert into the `providers` table with `profile_id` set to NULL.
-- Example:
-- INSERT INTO public.providers (license_number, bio, is_accepting_patients)
-- VALUES ('UNLINKED-001', 'This provider is a seed record waiting to be linked.', false); 