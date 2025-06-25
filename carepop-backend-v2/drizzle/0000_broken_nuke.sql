CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'completed', 'canceled_by_patient', 'canceled_by_admin', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');--> statement-breakpoint
CREATE TYPE "public"."medical_record_type" AS ENUM('PRESCRIPTION', 'LAB_ORDER', 'DOCTOR_NOTE');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'processing', 'shipped', 'delivered', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('patient', 'admin');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"appointment_time" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"reason_for_visit" text,
	"visit_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"address" jsonb,
	"phone_number" text,
	"logo_url" text,
	"location" "geography(Point, 4326)",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "doctor_clinics" (
	"doctor_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	CONSTRAINT "doctor_clinics_pkey" PRIMARY KEY("doctor_id","clinic_id")
);
--> statement-breakpoint
ALTER TABLE "doctor_clinics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "doctor_services" (
	"doctor_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "doctor_services_pkey" PRIMARY KEY("doctor_id","service_id")
);
--> statement-breakpoint
ALTER TABLE "doctor_services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"full_name" text NOT NULL,
	"specialty_text" text,
	"bio" text,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doctors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "health_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"patient_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"mood" text,
	"symptoms" text[],
	"notes" text,
	CONSTRAINT "health_logs_patient_id_log_date_key" UNIQUE("patient_id","log_date")
);
--> statement-breakpoint
ALTER TABLE "health_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_quantity_on_hand_check" CHECK (quantity_on_hand >= 0)
);
--> statement-breakpoint
ALTER TABLE "inventory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"record_type" "medical_record_type" NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medical_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "menstrual_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"patient_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date
);
--> statement-breakpoint
ALTER TABLE "menstrual_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "patient_order_items" (
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_purchase" numeric(10, 2) NOT NULL,
	CONSTRAINT "patient_order_items_pkey" PRIMARY KEY("order_id","product_id"),
	CONSTRAINT "patient_order_items_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
ALTER TABLE "patient_order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "patient_orders" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"patient_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"shipping_address" jsonb,
	"tracking_number" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "product_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"sku" text,
	"price" numeric(10, 2) NOT NULL,
	"requires_prescription" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "products_sku_key" UNIQUE("sku"),
	CONSTRAINT "products_price_check" CHECK (price >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"middle_initial" text,
	"last_name" text,
	"email" text NOT NULL,
	"contact_no" text,
	"gender_identity" text,
	"pronouns" text,
	"assigned_sex_at_birth" text,
	"birthday" date,
	"civil_status" text,
	"religion" text,
	"occupation" text,
	"philhealth_no" text,
	"street" text,
	"baranggay_code" text,
	"city_municipality_code" text,
	"province_code" text,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'patient' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "provider_availability" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "provider_availability_doctor_day_unique" UNIQUE("doctor_id","day_of_week")
);
--> statement-breakpoint
ALTER TABLE "provider_availability" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_appointment_id_key" UNIQUE("appointment_id"),
	CONSTRAINT "reviews_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "service_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "services_duration_minutes_check" CHECK (duration_minutes > 0),
	CONSTRAINT "services_price_check" CHECK (price >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_clinic_id" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_patient_id" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_service_id" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "fk_doctor_clinics_clinic_id" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "fk_doctor_clinics_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_services" ADD CONSTRAINT "fk_doctor_services_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_services" ADD CONSTRAINT "fk_doctor_services_service_id" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_logs" ADD CONSTRAINT "fk_health_logs_patient_id" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "fk_inventory_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "fk_medical_records_appointment_id" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menstrual_logs" ADD CONSTRAINT "fk_menstrual_logs_patient_id" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_order_items" ADD CONSTRAINT "fk_patient_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "public"."patient_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_order_items" ADD CONSTRAINT "fk_patient_order_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_orders" ADD CONSTRAINT "fk_patient_orders_patient_id" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_products_category_id" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "fk_profiles_id" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_availability" ADD CONSTRAINT "provider_availability_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_appointment_id" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_patient_id" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "fk_services_category_id" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_appointments_clinic_id" ON "appointments" USING btree ("clinic_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_doctor_id" ON "appointments" USING btree ("doctor_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_patient_id" ON "appointments" USING btree ("patient_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "clinics_location_idx" ON "clinics" USING gist ("location" gist_geography_ops);--> statement-breakpoint
CREATE INDEX "idx_health_logs_patient_id_log_date" ON "health_logs" USING btree ("patient_id" date_ops,"log_date" date_ops);--> statement-breakpoint
CREATE POLICY "Admins can manage all patient-owned data." ON "appointments" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Patients can create their own appointments." ON "appointments" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Patients can update (e.g., cancel) their own appointments." ON "appointments" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Patients can view their own appointments." ON "appointments" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "clinics" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "clinics" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "doctor_clinics" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "doctor_clinics" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "doctor_services" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "doctor_services" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "doctors" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "doctors" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Patients can manage their own health logs." ON "health_logs" AS PERMISSIVE FOR ALL TO public USING ((auth.uid() = patient_id));--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "inventory" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Admins can manage all patient-owned data." ON "medical_records" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Patients can view their own medical records." ON "medical_records" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Patients can manage their own menstrual logs." ON "menstrual_logs" AS PERMISSIVE FOR ALL TO public USING ((auth.uid() = patient_id));--> statement-breakpoint
CREATE POLICY "Admins can manage all patient-owned data." ON "patient_order_items" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Patients can view their own order items." ON "patient_order_items" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage all patient-owned data." ON "patient_orders" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Patients can manage their own orders." ON "patient_orders" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "product_categories" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "product_categories" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "products" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "products" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage all profiles." ON "profiles" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Users can update their own profile." ON "profiles" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own profile." ON "profiles" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "provider_availability" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "provider_availability" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage all reviews." ON "reviews" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can read reviews." ON "reviews" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Patients can create reviews for their own appointments." ON "reviews" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "service_categories" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "service_categories" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can manage platform data." ON "services" AS PERMISSIVE FOR ALL TO public USING ((get_my_role() = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Anyone can view public data." ON "services" AS PERMISSIVE FOR SELECT TO public;