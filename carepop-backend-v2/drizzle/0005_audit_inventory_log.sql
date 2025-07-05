CREATE TYPE "audit_change_type" AS ENUM ('initial_stock', 'manual_update', 'sale', 'return', 'spoilage', 'reconciliation');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_audit_log" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "item_id" uuid NOT NULL,
    "clinic_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "change_type" "audit_change_type" NOT NULL,
    "quantity_change" integer NOT NULL,
    "old_quantity" integer NOT NULL,
    "new_quantity" integer NOT NULL,
    "reason" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "inventory_audit_log" ADD CONSTRAINT "inventory_audit_log_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "inventory_audit_log" ADD CONSTRAINT "inventory_audit_log_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "inventory_audit_log" ADD CONSTRAINT "inventory_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_item_idx" ON "inventory_audit_log" ("item_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_clinic_idx" ON "inventory_audit_log" ("clinic_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_user_idx" ON "inventory_audit_log" ("user_id"); 