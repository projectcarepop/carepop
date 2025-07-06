-- Create the new table for storing multiple batches per inventory item
CREATE TABLE "inventory_item_batches" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"item_id" uuid NOT NULL,
	"batch_number" text,
	"quantity" integer NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add a foreign key constraint to link batches to their parent inventory item
-- ON DELETE cascade means if an inventory item is deleted, all its batches are also deleted.
DO $$ BEGIN
 ALTER TABLE "inventory_item_batches" ADD CONSTRAINT "inventory_item_batches_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create an index for faster lookups of batches by item
CREATE INDEX "batch_item_id_idx" ON "inventory_item_batches" ("item_id");

-- Now that we have a dedicated table for batches, we can remove the old, single-batch columns from the main inventory_items table.
ALTER TABLE "inventory_items" DROP COLUMN "batch_number";
ALTER TABLE "inventory_items" DROP COLUMN "expiry_date"; 