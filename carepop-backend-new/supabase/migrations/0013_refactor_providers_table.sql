-- Migration: 0013_refactor_providers_table.sql
-- Description: This migration refactors the providers table to be a self-contained
-- entity, removing its link to the profiles table and using a single `full_name` column.

-- Step 1: Add new columns to hold provider-specific information.
-- We add them first to avoid data loss if we were to migrate existing data.
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Remove the old, separate name columns if they exist from a previous failed migration.
ALTER TABLE public.providers
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name;

-- Add a unique constraint to the email to prevent duplicate providers.
-- This is wrapped in a DO block to handle cases where the constraint might already exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'providers_email_key' AND conrelid = 'public.providers'::regclass
    ) THEN
        ALTER TABLE public.providers ADD CONSTRAINT providers_email_key UNIQUE (email);
    END IF;
END;
$$;


-- Step 2: Remove the now-obsolete link to the profiles table.
ALTER TABLE public.providers
DROP COLUMN IF EXISTS profile_id;

-- Step 3: Ensure the RLS policy is simple and clean for admin access.
-- This policy grants full access to any user authenticated as an admin.
DROP POLICY IF EXISTS "Admins can manage all provider info" ON public.providers;
CREATE POLICY "Admins can manage all provider info"
ON public.providers
FOR ALL
TO authenticated
USING (is_admin(auth.uid()::text))
WITH CHECK (is_admin(auth.uid()::text)); 