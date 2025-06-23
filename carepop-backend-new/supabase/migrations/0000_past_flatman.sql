CREATE TABLE "inventory_item_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"supplier_id" uuid,
	"batch_number" text,
	"initial_quantity" integer NOT NULL,
	"current_quantity" integer NOT NULL,
	"expiry_date" timestamp with time zone,
	"received_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_clerk_id_unique";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "health_entries" DROP CONSTRAINT "health_entries_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "providers" DROP CONSTRAINT "providers_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "patient_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "health_entries" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ADD PRIMARY KEY ("clerk_id");--> statement-breakpoint
ALTER TABLE "providers" ALTER COLUMN "profile_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_item_batches" ADD CONSTRAINT "inventory_item_batches_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_batches" ADD CONSTRAINT "inventory_item_batches_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_profiles_clerk_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_entries" ADD CONSTRAINT "health_entries_user_id_profiles_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_profile_id_profiles_clerk_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "id";