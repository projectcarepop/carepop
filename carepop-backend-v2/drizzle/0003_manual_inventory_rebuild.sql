-- Dropping the old tables as per the plan
DROP TABLE IF EXISTS "inventory";
DROP TABLE IF EXISTS "product_categories" CASCADE;

-- Re-creating product_categories
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text
);

-- Creating the new inventory_items table
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"product_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"batch_number" text,
	"expiry_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Adding foreign key constraints
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;

-- Adding index
CREATE INDEX "inventory_product_clinic_idx" ON "inventory_items" USING btree ("product_id","clinic_id"); 