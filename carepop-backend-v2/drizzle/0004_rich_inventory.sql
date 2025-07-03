ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "product_category_id" uuid;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "item_name" text NOT NULL;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "sku" text;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "generic_name" text;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "brand_name" text;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "dosage_form" text;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "strength" text;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "reorder_level" integer DEFAULT 10 NOT NULL;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "purchase_price" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "selling_price" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "location" text;
--> statement-breakpoint
DROP INDEX IF EXISTS "inventory_product_clinic_idx";
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "product_id";
--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_sku_idx" ON "inventory_items" ("sku");
--> statement-breakpoint
CREATE INDEX "inventory_clinic_id_idx" ON "inventory_items" ("clinic_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "product_categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_reorder_level_check" CHECK("reorder_level" >= 0); 