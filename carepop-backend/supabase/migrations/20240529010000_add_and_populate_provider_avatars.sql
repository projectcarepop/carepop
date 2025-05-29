-- Add the avatar_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'providers'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.providers
        ADD COLUMN avatar_url TEXT NULL;

        COMMENT ON COLUMN public.providers.avatar_url IS 'URL to the provider\'s avatar image, likely stored in Supabase Storage.';
    END IF;
END $$;

-- Populate avatar_url for existing providers
-- Please replace 'URL_FOR_PATRICIA_LEE' etc. with actual, publicly accessible image URLs.
-- These could be Supabase Storage URLs if you upload the images there first.

UPDATE public.providers
SET avatar_url = 'URL_FOR_PATRICIA_LEE' -- Placeholder: e.g., 'https://example.com/avatars/patricia_lee.jpg'
WHERE id = '076c1e82-f51f-40e4-8e5e-45ca238fd2e1';

UPDATE public.providers
SET avatar_url = 'URL_FOR_ELENA_BAUTISTA' -- Placeholder
WHERE id = '3507f83d-6727-489b-bf23-6b52a3d874bd';

UPDATE public.providers
SET avatar_url = 'URL_FOR_ISABELLA_DAVID' -- Placeholder
WHERE id = '3f52e255-7e00-42ab-adbc-0d52b53fd496';

UPDATE public.providers
SET avatar_url = 'URL_FOR_JOHN_DELA_CRUZ' -- Placeholder
WHERE id = '49c05f42-0b13-413d-804d-3868bc810f32';

UPDATE public.providers
SET avatar_url = 'URL_FOR_MARK_REYES' -- Placeholder
WHERE id = '5c9cf4fa-9abc-45b7-82d6-53e69ebba643';

UPDATE public.providers
SET avatar_url = 'URL_FOR_MARIA_SANTOS' -- Placeholder
WHERE id = '7671ca39-e888-46ec-8034-14b24d5c1bdc';

UPDATE public.providers
SET avatar_url = 'URL_FOR_CARLOS_IMPERIAL' -- Placeholder
WHERE id = '77408ad1-f64e-4b52-8fdf-14a94011d7d2';

UPDATE public.providers
SET avatar_url = 'URL_FOR_JOSE_AQUINO' -- Placeholder
WHERE id = '7fa4e183-3ce5-44e3-98f7-91edabed0cf7';

UPDATE public.providers
SET avatar_url = 'URL_FOR_KEVIN_GO' -- Placeholder
WHERE id = 'c391c807-6a4d-4bf8-aaff-e5440d1d2df1';

UPDATE public.providers
SET avatar_url = 'URL_FOR_MIGUEL_CASTRO' -- Placeholder
WHERE id = 'cb3ad62c-2caa-4315-bd59-c90fe3a43595';

UPDATE public.providers
SET avatar_url = 'URL_FOR_SOFIA_GARCIA' -- Placeholder
WHERE id = 'd785e602-0341-442b-9f31-58e148e19f30';

UPDATE public.providers
SET avatar_url = 'URL_FOR_AILEEN_TAN' -- Placeholder
WHERE id = 'e4ea81aa-27aa-4f6b-b923-cae381355ea6';

-- Add more UPDATE statements as needed for other providers from your CSV.