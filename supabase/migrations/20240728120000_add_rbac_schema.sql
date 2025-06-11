-- Create an ENUM type for our roles IF IT DOES NOT EXIST
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('User', 'Admin', 'Provider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the roles table to store role definitions
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name public.app_role NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populate the roles table with our defined roles
INSERT INTO public.roles (name) VALUES ('User'), ('Admin'), ('Provider') ON CONFLICT (name) DO NOTHING;

-- Create the user_roles join table to link users to their roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- It's good practice to add indexes to foreign key columns for performance.
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- This ensures that the RLS (Row Level Security) policies on the profiles table
-- can rely on the user_id from the authentication context.
-- This command assumes the profiles table already exists.
-- It adds a cascading delete, so if a user is deleted from auth.users, their profile is also removed.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_profiles_on_user_id' AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT fk_profiles_on_user_id
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END;
$$; 