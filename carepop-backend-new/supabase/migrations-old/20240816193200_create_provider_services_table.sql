-- MIGRATION: Create the missing provider_services join table.
-- This table is essential for linking providers to the specific services they offer.

CREATE TABLE "public"."provider_services" (
    "provider_id" uuid NOT NULL,
    "service_id" uuid NOT NULL,
    CONSTRAINT "provider_services_pkey" PRIMARY KEY (provider_id, service_id),
    CONSTRAINT "provider_services_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    CONSTRAINT "provider_services_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Add comments to the table and columns for clarity.
COMMENT ON TABLE "public"."provider_services" IS 'Join table to associate providers with the specific services they are qualified to offer.';
COMMENT ON COLUMN "public"."provider_services"."provider_id" IS 'Foreign key to the providers table.';
COMMENT ON COLUMN "public"."provider_services"."service_id" IS 'Foreign key to the services table.'; 