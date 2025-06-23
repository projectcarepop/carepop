-- Migration: 0015_remove_providers_feature.sql
-- Description: This migration completely removes the providers feature by dropping
-- all related tables and their dependent objects from the database schema.

-- Drop the linking table first to remove dependencies.
DROP TABLE IF EXISTS public.provider_specializations;

-- Drop the availability table.
DROP TABLE IF EXISTS public.provider_availability;

-- Finally, drop the main providers table and all its dependent constraints (like foreign keys
-- in appointments, medical_records, etc.) using CASCADE.
DROP TABLE IF EXISTS public.providers CASCADE; 