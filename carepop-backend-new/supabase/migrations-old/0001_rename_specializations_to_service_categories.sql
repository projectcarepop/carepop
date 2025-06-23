CREATE TYPE "public"."health_entry_type" AS ENUM('pill', 'mood', 'menstrual_cycle');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_providers" (
	"clinic_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_services" (
	"clinic_id" uuid NOT NULL,
	"service_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_type" "health_entry_type" NOT NULL,
	"status" text,
	"value" text,
	"details" jsonb,
	"entry_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"supabase_auth_user_id_old" text,
	"first_name" text,
	"last_name" text,
	"middle_initial" text,
	"date_of_birth" text,
	"contact_no" text,
	"avatar_url" text,
	"gender_identity" text,
	"pronouns" text,
	"assigned_sex_at_birth" text,
	"civil_status" text,
	"religion" text,
	"occupation" text,
	"philhealth_no" text,
	"street" text,
	"barangay_code" text,
	"city_municipality_code" text,
	"province_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "provider_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_services" (
	"provider_id" uuid NOT NULL,
	"service_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"license_number" text,
	"bio" text,
	"accepting_new_patients" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "providers_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"specialization_id" uuid,
	"price" numeric(10, 2),
	"duration_minutes" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specializations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "postal_code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "street_address" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "locality" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "country_code" text DEFAULT 'PH';--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "latitude" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "longitude" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "contact_phone" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "operation_days" text[];--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "operation_hours" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "fpop_chapter_affiliation" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "additional_notes" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_providers" ADD CONSTRAINT "clinic_providers_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_providers" ADD CONSTRAINT "clinic_providers_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_entries" ADD CONSTRAINT "health_entries_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_availability" ADD CONSTRAINT "provider_availability_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_specialization_id_specializations_id_fk" FOREIGN KEY ("specialization_id") REFERENCES "public"."specializations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "province";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "operating_hours";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN "is_accepting_new_patients";