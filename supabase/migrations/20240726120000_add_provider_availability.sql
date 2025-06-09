-- Add weekly_availability column to providers table
ALTER TABLE "public"."providers"
ADD COLUMN "weekly_availability" jsonb;

-- Add a comment to describe the column
COMMENT ON COLUMN "public"."providers"."weekly_availability" IS 'Stores the provider''s weekly schedule, e.g., {"monday": {"start": "09:00", "end": "17:00", "isActive": true}, "tuesday": ...}'; 