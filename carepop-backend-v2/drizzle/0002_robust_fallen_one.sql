CREATE TYPE "public"."mood" AS ENUM('happy', 'sad', 'neutral', 'anxious', 'stressed');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'manager';--> statement-breakpoint
CREATE TABLE "health_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"patient_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"mood" "mood",
	"symptoms" text[],
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "menstrual_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"patient_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date
);
--> statement-breakpoint
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_patient_id_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menstrual_logs" ADD CONSTRAINT "menstrual_logs_patient_id_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "health_logs_patient_id_log_date_key" ON "health_logs" USING btree ("patient_id","log_date");