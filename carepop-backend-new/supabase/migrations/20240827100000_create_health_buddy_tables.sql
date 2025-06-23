-- Create the enum type for health entry types
CREATE TYPE health_entry_type AS ENUM ('pill', 'mood', 'menstrual_cycle');

-- Create the table to store health entries
CREATE TABLE "public"."health_entries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "entry_type" health_entry_type NOT NULL,
    "status" TEXT, -- e.g., for pill: 'taken', 'missed'; for menstrual: 'period_start', 'symptom_logged'
    "value" TEXT, -- e.g., for mood: 'happy', 'neutral', 'sad'
    "details" JSONB, -- For storing extra data like specific symptoms
    "entry_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX "idx_health_entries_user_id_entry_date" ON "public"."health_entries"("user_id", "entry_date" DESC);
CREATE INDEX "idx_health_entries_user_id_entry_type" ON "public"."health_entries"("user_id", "entry_type");

-- Add a trigger to update the updated_at column
CREATE TRIGGER "handle_updated_at"
BEFORE UPDATE ON "public"."health_entries"
FOR EACH ROW
EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');

-- Enable Row Level Security
ALTER TABLE "public"."health_entries" ENABLE ROW LEVEL SECURITY;

-- Policies for health_entries
-- Users can see their own health entries
CREATE POLICY "Allow users to see their own health entries"
ON "public"."health_entries"
FOR SELECT USING (
  auth.uid() = user_id
);

-- Users can insert their own health entries
CREATE POLICY "Allow users to insert their own health entries"
ON "public"."health_entries"
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Users can update their own health entries
CREATE POLICY "Allow users to update their own health entries"
ON "public"."health_entries"
FOR UPDATE USING (
  auth.uid() = user_id
);

-- Users can delete their own health entries
CREATE POLICY "Allow users to delete their own health entries"
ON "public"."health_entries"
FOR DELETE USING (
  auth.uid() = user_id
); 