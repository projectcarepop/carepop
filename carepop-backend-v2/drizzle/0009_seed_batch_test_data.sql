-- This script seeds the inventory_items and inventory_item_batches tables with test data.
-- It is designed to work with the schema defined in `drizzle/schema.ts` as of the last check.
-- In this schema, pricing is on the main `inventory_items` table, not the batches table.

DO $$
DECLARE
    -- !!! These UUIDs must match existing records in your 'clinics' and 'product_categories' tables !!!
    clinic_id_1 uuid := '9f73a667-62b1-475f-be33-42f935122e83';
    clinic_id_2 uuid := '9a872c9b-3ccf-4c64-963a-d1db1f7c1440';
    
    category_pain_relief uuid := '4e6ff962-e28b-45dc-8557-2c33c1136e10';
    category_antibiotics uuid := 'c594baac-4add-418c-a631-743959e9cb7d';
    category_vitamins uuid := 'f2b9ff23-5325-42a1-9a60-23adf6da5bab';
    category_contraceptives uuid := '238ee133-4f08-4e87-bf71-3ad88f98df76';

    -- A variable to hold the ID of the item being processed
    current_item_id uuid;

BEGIN
    -- Clear existing data to ensure a clean slate and prevent duplicate errors on re-run.
    RAISE NOTICE 'Deleting existing inventory data...';
    DELETE FROM inventory_item_batches;
    DELETE FROM inventory_items;
    RAISE NOTICE 'Deletion complete.';

    -- Use a temporary table-like structure to hold the raw data.
    WITH raw_item_data (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) AS (
        VALUES
            -- --- Products for Clinic 1 ---
            (clinic_id_1, category_pain_relief, 'Paracetamol 500mg Tablets', 'Paracetamol', 'Biogesic', 'Tablet', '500mg', 150, 20, 1.50, 3.00, 'Aisle 1, Shelf A', 'SKU-CL1-001'),
            (clinic_id_1, category_pain_relief, 'Ibuprofen 200mg Capsules', 'Ibuprofen', 'Advil', 'Capsule', '200mg', 80, 15, 4.00, 7.50, 'Aisle 1, Shelf A', 'SKU-CL1-002'),
            (clinic_id_1, category_pain_relief, 'Mefenamic Acid 500mg', 'Mefenamic Acid', 'Dolfenal', 'Tablet', '500mg', 60, 10, 8.00, 15.00, 'Aisle 1, Shelf B', 'SKU-CL1-003'),
            (clinic_id_1, category_antibiotics, 'Amoxicillin 500mg Capsules', 'Amoxicillin', 'Generic', 'Capsule', '500mg', 120, 25, 5.00, 10.00, 'Aisle 2, Shelf C', 'SKU-CL1-004'),
            (clinic_id_1, category_antibiotics, 'Ciprofloxacin 500mg Tablets', 'Ciprofloxacin', 'Ciprobay', 'Tablet', '500mg', 40, 10, 25.00, 50.00, 'Aisle 2, Shelf C', 'SKU-CL1-005'),
            (clinic_id_1, category_vitamins, 'Vitamin C 500mg Tablets', 'Ascorbic Acid', 'Poten-Cee', 'Tablet', '500mg', 200, 50, 2.00, 4.50, 'Aisle 3, Shelf D', 'SKU-CL1-006'),
            (clinic_id_1, category_vitamins, 'Vitamin B-Complex', 'B-Complex', 'Generic', 'Tablet', 'Standard', 90, 30, 3.00, 6.00, 'Aisle 3, Shelf D', 'SKU-CL1-007'),
            (clinic_id_1, category_contraceptives, 'Oral Contraceptive Pills - 21-day pack', 'Ethinylestradiol + Levonorgestrel', 'Yasmin', 'Pill', '0.03mg/3mg', 50, 10, 250.00, 450.00, 'Aisle 4, Shelf E', 'SKU-CL1-008'),
            (clinic_id_1, category_contraceptives, 'Injectable Contraceptive', 'Medroxyprogesterone acetate', 'Depo-Provera', 'Injection', '150mg/mL', 25, 5, 80.00, 150.00, 'Aisle 4, Shelf E', 'SKU-CL1-009'),
            (clinic_id_1, category_contraceptives, 'Emergency Contraceptive Pill', 'Levonorgestrel', 'Plan B', 'Pill', '1.5mg', 15, 5, 400.00, 750.00, 'Aisle 4, Shelf E', 'SKU-CL1-010'),

            -- --- Products for Clinic 2 ---
            (clinic_id_2, category_pain_relief, 'Paracetamol 500mg Tablets', 'Paracetamol', 'Calpol', 'Tablet', '500mg', 250, 30, 1.75, 3.50, 'Section 1', 'SKU-CL2-001'),
            (clinic_id_2, category_pain_relief, 'Naproxen Sodium 220mg', 'Naproxen Sodium', 'Flanax', 'Tablet', '220mg', 70, 20, 6.00, 12.00, 'Section 1', 'SKU-CL2-002'),
            (clinic_id_2, category_antibiotics, 'Azithromycin 500mg Tablets', 'Azithromycin', 'Zithromax', 'Tablet', '500mg', 50, 15, 45.00, 80.00, 'Section 2', 'SKU-CL2-003'),
            (clinic_id_2, category_antibiotics, 'Doxycycline 100mg Capsules', 'Doxycycline', 'Generic', 'Capsule', '100mg', 85, 20, 12.00, 25.00, 'Section 2', 'SKU-CL2-004'),
            (clinic_id_2, category_antibiotics, 'Co-amoxiclav 625mg', 'Amoxicillin + Clavulanic Acid', 'Augmentin', 'Tablet', '625mg', 30, 10, 35.00, 65.00, 'Section 2', 'SKU-CL2-005'),
            (clinic_id_2, category_vitamins, 'Multivitamins + Iron', 'Multivitamins, Iron', 'Stresstabs', 'Tablet', 'Standard', 180, 40, 7.00, 14.00, 'Section 3', 'SKU-CL2-006'),
            (clinic_id_2, category_vitamins, 'Calcium + Vitamin D', 'Calcium, Vitamin D', 'Caltrate', 'Tablet', '600mg/400IU', 100, 30, 8.00, 16.00, 'Section 3', 'SKU-CL2-007'),
            (clinic_id_2, category_contraceptives, 'Oral Contraceptive Pills - 28-day pack', 'Drospirenone + Ethinylestradiol', 'Yaz', 'Pill', '3mg/0.02mg', 60, 15, 280.00, 500.00, 'Section 4', 'SKU-CL2-008'),
            (clinic_id_2, category_contraceptives, 'Hormonal IUD', 'Levonorgestrel-releasing intrauterine system', 'Mirena', 'IUD', '52mg', 10, 2, 8000.00, 15000.00, 'Section 4', 'SKU-CL2-009'),
            (clinic_id_2, category_contraceptives, 'Condoms - 12 pack', 'Latex', 'Durex', 'Condom', 'N/A', 100, 20, 150.00, 250.00, 'Section 4', 'SKU-CL2-010')
    ),
    -- Step 1: Insert the full product details into `inventory_items`, including pricing.
    inserted_items AS (
        INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku)
        SELECT clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku FROM raw_item_data
        RETURNING id, sku, quantity_on_hand
    )
    -- Step 2: Create a corresponding batch for each newly inserted item.
    -- This batch only contains quantity and expiry information, as pricing is on the parent item.
    INSERT INTO inventory_item_batches (item_id, batch_number, quantity, expiry_date)
    SELECT
        ii.id,
        ii.sku || '-B1', -- Generate a simple, unique batch number
        ii.quantity_on_hand,
        (now() + interval '1 year' + (random() * interval '6 months')) -- Randomize expiry date
    FROM
        inserted_items ii;

    RAISE NOTICE 'Seeding of inventory items and their initial batches is complete.';

END $$; 