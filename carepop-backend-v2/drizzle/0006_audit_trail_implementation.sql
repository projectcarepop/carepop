-- Migration: Add audit trail functionality for compliance and security monitoring
-- Created: 2024-12-19
-- Purpose: Track all administrative actions and medical record access for DPA/HIPAA compliance

-- Create audit_logs table for comprehensive activity tracking
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT NOW() NOT NULL,
    "user_id" uuid NOT NULL,
    "user_email" text NOT NULL,
    "user_role" varchar(50) NOT NULL,
    "action" varchar(100) NOT NULL,
    "resource_type" varchar(50) NOT NULL,
    "resource_id" uuid NOT NULL,
    "patient_id" uuid, -- For admin actions on patient data
    "outcome" varchar(20) NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILED', 'ERROR')),
    "metadata" jsonb, -- Flexible additional data
    "ip_address" inet,
    "user_agent" text,
    "session_id" uuid
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "public"."audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "public"."audit_logs" ("timestamp");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "public"."audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_patient_id_idx" ON "public"."audit_logs" ("patient_id");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_idx" ON "public"."audit_logs" ("resource_type", "resource_id");

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS "audit_logs_user_timestamp_idx" ON "public"."audit_logs" ("user_id", "timestamp" DESC);

-- Create view for easy admin audit queries
CREATE OR REPLACE VIEW "public"."admin_audit_summary" AS
SELECT 
    al.id,
    al.timestamp,
    al.user_email,
    al.action,
    al.resource_type,
    al.resource_id,
    al.patient_id,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    al.outcome,
    al.metadata
FROM audit_logs al
LEFT JOIN profiles p ON al.patient_id = p.id
WHERE al.user_role IN ('admin', 'manager')
ORDER BY al.timestamp DESC;

-- Add comments for documentation
COMMENT ON TABLE "public"."audit_logs" IS 'Comprehensive audit trail for compliance and security monitoring';
COMMENT ON COLUMN "public"."audit_logs"."user_id" IS 'ID of the user performing the action';
COMMENT ON COLUMN "public"."audit_logs"."patient_id" IS 'ID of the patient whose data is being accessed (for admin actions)';
COMMENT ON COLUMN "public"."audit_logs"."metadata" IS 'JSON field for flexible additional audit data';
COMMENT ON VIEW "public"."admin_audit_summary" IS 'Easy-to-query view of admin actions with patient details';

-- Add Row Level Security (RLS) for audit logs
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can view audit logs" ON "public"."audit_logs"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_app_meta_data->>'role')::text IN ('admin', 'manager')
        )
    );

-- Policy: System can insert audit logs (no user restriction for logging)
CREATE POLICY "System can insert audit logs" ON "public"."audit_logs"
    FOR INSERT
    WITH CHECK (true);

-- Add trigger to prevent modification of audit logs (immutable)
CREATE OR REPLACE FUNCTION prevent_audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be modified';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_updates
    BEFORE UPDATE ON "public"."audit_logs"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_changes();

CREATE TRIGGER prevent_audit_log_deletes
    BEFORE DELETE ON "public"."audit_logs"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_changes(); 