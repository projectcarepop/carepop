-- Migration for Health Buddy Feature

-- Step 1: Create the enum type for health entry types, only if it doesn't already exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'health_entry_type') THEN
        CREATE TYPE health_entry_type AS ENUM ('pill', 'mood', 'menstrual_cycle');
    END IF;
END$$;

-- Step 2: Create the table to store health entries, only if it doesn't already exist.
CREATE TABLE IF NOT EXISTS "public"."health_entries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL REFERENCES "public"."profiles"("clerk_id") ON DELETE CASCADE,
    "entry_type" health_entry_type NOT NULL,
    "status" TEXT, -- e.g., for pill: 'taken', 'missed'; for menstrual: 'period_start', 'symptom_logged'
    "value" TEXT, -- e.g., for mood: 'happy', 'neutral', 'sad'
    "details" JSONB, -- For storing extra data like specific symptoms
    "entry_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Add indexes for performance. These are safe to run multiple times.
CREATE INDEX IF NOT EXISTS "idx_health_entries_user_id_entry_date" ON "public"."health_entries"("user_id", "entry_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_health_entries_user_id_entry_type" ON "public"."health_entries"("user_id", "entry_type");

-- Step 4: Drop the old incorrect trigger if it exists, then create the correct one.
-- The function public.moddatetime() takes no arguments.
DROP TRIGGER IF EXISTS "handle_updated_at" ON "public"."health_entries";
CREATE TRIGGER "handle_updated_at"
BEFORE UPDATE ON "public"."health_entries"
FOR EACH ROW
EXECUTE FUNCTION "public"."moddatetime"(); -- Corrected: No arguments

-- Step 5: Enable Row Level Security.
ALTER TABLE "public"."health_entries" ENABLE ROW LEVEL SECURITY;

-- Step 6: Define RLS policies. Dropping and recreating ensures they are up-to-date.
DROP POLICY IF EXISTS "Allow users to see their own health entries" ON "public"."health_entries";
CREATE POLICY "Allow users to see their own health entries"
ON "public"."health_entries"
FOR SELECT USING (
  auth.uid()::text = user_id
);

DROP POLICY IF EXISTS "Allow users to insert their own health entries" ON "public"."health_entries";
CREATE POLICY "Allow users to insert their own health entries"
ON "public"."health_entries"
FOR INSERT WITH CHECK (
  auth.uid()::text = user_id
);

DROP POLICY IF EXISTS "Allow users to update their own health entries" ON "public"."health_entries";
CREATE POLICY "Allow users to update their own health entries"
ON "public"."health_entries"
FOR UPDATE USING (
  auth.uid()::text = user_id
);

DROP POLICY IF EXISTS "Allow users to delete their own health entries" ON "public"."health_entries";
CREATE POLICY "Allow users to delete their own health entries"
ON "public"."health_entries"
FOR DELETE USING (
  auth.uid()::text = user_id
); 