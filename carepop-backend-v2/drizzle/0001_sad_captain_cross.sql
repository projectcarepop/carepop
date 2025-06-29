ALTER TYPE "public"."medical_record_type" ADD VALUE 'LAB_RESULT';--> statement-breakpoint
ALTER TYPE "public"."medical_record_type" ADD VALUE 'CLINICAL_DOCUMENT';--> statement-breakpoint
CREATE TABLE "clinic_services" (
	"clinic_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "clinic_services_clinic_id_service_id_pk" PRIMARY KEY("clinic_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "record_doctor_notes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"record_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_documents" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"record_id" uuid NOT NULL,
	"document_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"record_id" uuid NOT NULL,
	"medication" text NOT NULL,
	"dosage" text,
	"frequency" text,
	"start_date" date,
	"end_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "doctor_clinics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "doctor_services" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "doctors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "inventory" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "medical_records" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "provider_availability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "health_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "menstrual_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patient_order_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patient_orders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "Patients can manage their own health logs." ON "health_logs" CASCADE;--> statement-breakpoint
DROP TABLE "health_logs" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can manage their own menstrual logs." ON "menstrual_logs" CASCADE;--> statement-breakpoint
DROP TABLE "menstrual_logs" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage all patient-owned data." ON "patient_order_items" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can view their own order items." ON "patient_order_items" CASCADE;--> statement-breakpoint
DROP TABLE "patient_order_items" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage all patient-owned data." ON "patient_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can manage their own orders." ON "patient_orders" CASCADE;--> statement-breakpoint
DROP TABLE "patient_orders" CASCADE;--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_sku_key";--> statement-breakpoint
ALTER TABLE "provider_availability" DROP CONSTRAINT "provider_availability_doctor_day_unique";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_appointment_id_key";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_price_check";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_rating_check";--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_price_check";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_clinic_id";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_doctor_id";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_patient_id";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_service_id";
--> statement-breakpoint
ALTER TABLE "doctor_clinics" DROP CONSTRAINT "fk_doctor_clinics_clinic_id";
--> statement-breakpoint
ALTER TABLE "doctor_clinics" DROP CONSTRAINT "fk_doctor_clinics_doctor_id";
--> statement-breakpoint
ALTER TABLE "doctor_services" DROP CONSTRAINT "fk_doctor_services_doctor_id";
--> statement-breakpoint
ALTER TABLE "doctor_services" DROP CONSTRAINT "fk_doctor_services_service_id";
--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "fk_inventory_product_id";
--> statement-breakpoint
ALTER TABLE "medical_records" DROP CONSTRAINT "fk_medical_records_appointment_id";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "fk_products_category_id";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "fk_profiles_id";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "fk_reviews_appointment_id";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "fk_reviews_doctor_id";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "fk_reviews_patient_id";
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "fk_services_category_id";
--> statement-breakpoint
DROP INDEX "idx_appointments_clinic_id";--> statement-breakpoint
DROP INDEX "idx_appointments_doctor_id";--> statement-breakpoint
DROP INDEX "idx_appointments_patient_id";--> statement-breakpoint
DROP INDEX "clinics_location_idx";--> statement-breakpoint
ALTER TABLE "doctor_clinics" DROP CONSTRAINT "doctor_clinics_pkey";--> statement-breakpoint
ALTER TABLE "doctor_services" DROP CONSTRAINT "doctor_services_pkey";--> statement-breakpoint
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "doctor_clinics_doctor_id_clinic_id_pk" PRIMARY KEY("doctor_id","clinic_id");--> statement-breakpoint
ALTER TABLE "doctor_services" ADD CONSTRAINT "doctor_services_doctor_id_service_id_pk" PRIMARY KEY("doctor_id","service_id");--> statement-breakpoint
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_doctor_notes" ADD CONSTRAINT "record_doctor_notes_record_id_medical_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_documents" ADD CONSTRAINT "record_documents_record_id_medical_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_prescriptions" ADD CONSTRAINT "record_prescriptions_record_id_medical_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "doctor_clinics_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_clinics" ADD CONSTRAINT "doctor_clinics_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_services" ADD CONSTRAINT "doctor_services_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_services" ADD CONSTRAINT "doctor_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_appointments_clinic_id" ON "appointments" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_doctor_id" ON "appointments" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_patient_id" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "clinics_location_idx" ON "clinics" USING gist ("location");--> statement-breakpoint
ALTER TABLE "medical_records" DROP COLUMN "details";--> statement-breakpoint
ALTER TABLE "provider_availability" DROP COLUMN "is_available";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_unique" UNIQUE("appointment_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_price_check" CHECK (price >= 0);--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_check" CHECK (rating >= 1 AND rating <= 5);--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_price_check" CHECK (price >= 0);--> statement-breakpoint
DROP POLICY "Admins can manage all patient-owned data." ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can create their own appointments." ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can update (e.g., cancel) their own appointments." ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can view their own appointments." ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "clinics" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "clinics" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "doctor_clinics" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "doctor_clinics" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "doctor_services" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "doctor_services" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "doctors" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "doctors" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "inventory" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage all patient-owned data." ON "medical_records" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can view their own medical records." ON "medical_records" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "product_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "product_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "products" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "products" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage all profiles." ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own profile." ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view their own profile." ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "provider_availability" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "provider_availability" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage all reviews." ON "reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can read reviews." ON "reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Patients can create reviews for their own appointments." ON "reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "service_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "service_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can manage platform data." ON "services" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public data." ON "services" CASCADE;