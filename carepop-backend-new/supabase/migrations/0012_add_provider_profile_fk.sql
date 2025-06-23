-- Migration: 0012_add_provider_profile_fk.sql
-- This migration adds the explicit foreign key constraint between the
-- providers table and the profiles table. This is essential for the
-- Supabase API to understand the relationship and allow nested queries.

ALTER TABLE public.providers
ADD CONSTRAINT fk_providers_profile
FOREIGN KEY (profile_id) REFERENCES public.profiles(clerk_id) ON DELETE CASCADE; 