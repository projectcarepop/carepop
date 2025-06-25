-- Add all new columns to the profiles table
ALTER TABLE "public"."profiles"
    ADD COLUMN "first_name" text,
    ADD COLUMN "middle_initial" varchar,
    ADD COLUMN "last_name" text,
    ADD COLUMN "email" text,
    ADD COLUMN "contact_no" text,
    ADD COLUMN "gender_identity" text,
    ADD COLUMN "pronouns" text,
    ADD COLUMN "assigned_sex_at_birth" text,
    ADD COLUMN "civil_status" text,
    ADD COLUMN "religion" text,
    ADD COLUMN "occupation" text,
    ADD COLUMN "philhealth_no" text,
    ADD COLUMN "street" text,
    ADD COLUMN "baranggay_code" varchar,
    ADD COLUMN "city_municipality_code" varchar,
    ADD COLUMN "province_code" varchar,
    ADD COLUMN "avatar_url" text;

-- After adding the email column, update it to be not null and unique.
-- This is done in a separate step to allow for data migration if needed.
ALTER TABLE "public"."profiles"
    ALTER COLUMN "email" SET NOT NULL;

ALTER TABLE "public"."profiles"
    ADD CONSTRAINT "profiles_email_unique" UNIQUE("email");

-- Drop the now-redundant columns
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "full_name";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "date_of_birth"; 