-- Create a composite index to speed up queries that filter by user, entry type, and status.
-- This is critical for efficiently finding the last 'period_start' or 'pill' status for a user.
CREATE INDEX IF NOT EXISTS "idx_health_entries_user_type_status" ON "public"."health_entries"("user_id", "entry_type", "status"); 