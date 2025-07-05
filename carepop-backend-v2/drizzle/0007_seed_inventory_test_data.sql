-- This script seeds the inventory_items table with a variety of test products
-- for two different clinics.

-- IMPORTANT: You MUST replace the placeholder UUIDs below with actual UUIDs
-- from your 'clinics' and 'product_categories' tables.

-- To get your Clinic IDs, you can run:
-- SELECT id, name FROM clinics;

-- To get your Product Category IDs, you can run:
-- SELECT id, name FROM product_categories;


DO $$
DECLARE
    -- !!! REPLACE THESE PLACEHOLDERS !!!
    clinic_id_1 uuid := 'YOUR_CLINIC_ID_1'; -- e.g., '1a7a8e5a-7284-4e44-8f15-3e283f6f1f3a'
    clinic_id_2 uuid := 'YOUR_CLINIC_ID_2'; -- e.g., 'b2b1c3e4-8d5e-4f6g-9h1i-2j3k4l5m6n7o'
    
    category_pain_relief uuid := 'YOUR_PAIN_RELIEF_CATEGORY_ID';     -- e.g., 'c3c2b1a0-9e8d-7f6e-5d4c-3b2a10987654'
    category_antibiotics uuid := 'YOUR_ANTIBIOTICS_CATEGORY_ID';   -- e.g., 'd4d3c2b1-0f9e-8d7c-6b5a-498765432109'
    category_vitamins uuid := 'YOUR_VITAMINS_CATEGORY_ID';         -- e.g., 'e5e4d3c2-1g0f-9e8d-7c6b-5a4b3c2d1e0f'
    category_contraceptives uuid := 'YOUR_CONTRACEPTIVES_CATEGORY_ID'; -- e.g., 'f6f5e4d3-2h1g-0f9e-8d7c-6b5a4b3c2d1e'

BEGIN
    -- --- Products for Clinic 1 ---

    -- Pain Relief
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_1, category_pain_relief, 'Paracetamol 500mg Tablets', 'Paracetamol', 'Biogesic', 'Tablet', '500mg', 150, 20, 1.50, 3.00, 'Aisle 1, Shelf A', 'SKU-CL1-001'),
    (clinic_id_1, category_pain_relief, 'Ibuprofen 200mg Capsules', 'Ibuprofen', 'Advil', 'Capsule', '200mg', 80, 15, 4.00, 7.50, 'Aisle 1, Shelf A', 'SKU-CL1-002'),
    (clinic_id_1, category_pain_relief, 'Mefenamic Acid 500mg', 'Mefenamic Acid', 'Dolfenal', 'Tablet', '500mg', 60, 10, 8.00, 15.00, 'Aisle 1, Shelf B', 'SKU-CL1-003');

    -- Antibiotics
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_1, category_antibiotics, 'Amoxicillin 500mg Capsules', 'Amoxicillin', 'Generic', 'Capsule', '500mg', 120, 25, 5.00, 10.00, 'Aisle 2, Shelf C', 'SKU-CL1-004'),
    (clinic_id_1, category_antibiotics, 'Ciprofloxacin 500mg Tablets', 'Ciprofloxacin', 'Ciprobay', 'Tablet', '500mg', 40, 10, 25.00, 50.00, 'Aisle 2, Shelf C', 'SKU-CL1-005');

    -- Vitamins
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_1, category_vitamins, 'Vitamin C 500mg Tablets', 'Ascorbic Acid', 'Poten-Cee', 'Tablet', '500mg', 200, 50, 2.00, 4.50, 'Aisle 3, Shelf D', 'SKU-CL1-006'),
    (clinic_id_1, category_vitamins, 'Vitamin B-Complex', 'B-Complex', 'Generic', 'Tablet', 'Standard', 90, 30, 3.00, 6.00, 'Aisle 3, Shelf D', 'SKU-CL1-007');

    -- Contraceptives
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_1, category_contraceptives, 'Oral Contraceptive Pills - 21-day pack', 'Ethinylestradiol + Levonorgestrel', 'Yasmin', 'Pill', '0.03mg/3mg', 50, 10, 250.00, 450.00, 'Aisle 4, Shelf E', 'SKU-CL1-008'),
    (clinic_id_1, category_contraceptives, 'Injectable Contraceptive', 'Medroxyprogesterone acetate', 'Depo-Provera', 'Injection', '150mg/mL', 25, 5, 80.00, 150.00, 'Aisle 4, Shelf E', 'SKU-CL1-009'),
    (clinic_id_1, category_contraceptives, 'Emergency Contraceptive Pill', 'Levonorgestrel', 'Plan B', 'Pill', '1.5mg', 15, 5, 400.00, 750.00, 'Aisle 4, Shelf E', 'SKU-CL1-010');

    -- --- Products for Clinic 2 ---

    -- Pain Relief
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_2, category_pain_relief, 'Paracetamol 500mg Tablets', 'Paracetamol', 'Calpol', 'Tablet', '500mg', 250, 30, 1.75, 3.50, 'Section 1', 'SKU-CL2-001'),
    (clinic_id_2, category_pain_relief, 'Naproxen Sodium 220mg', 'Naproxen Sodium', 'Flanax', 'Tablet', '220mg', 70, 20, 6.00, 12.00, 'Section 1', 'SKU-CL2-002');
    
    -- Antibiotics
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_2, category_antibiotics, 'Azithromycin 500mg Tablets', 'Azithromycin', 'Zithromax', 'Tablet', '500mg', 50, 15, 45.00, 80.00, 'Section 2', 'SKU-CL2-003'),
    (clinic_id_2, category_antibiotics, 'Doxycycline 100mg Capsules', 'Doxycycline', 'Generic', 'Capsule', '100mg', 85, 20, 12.00, 25.00, 'Section 2', 'SKU-CL2-004'),
    (clinic_id_2, category_antibiotics, 'Co-amoxiclav 625mg', 'Amoxicillin + Clavulanic Acid', 'Augmentin', 'Tablet', '625mg', 30, 10, 35.00, 65.00, 'Section 2', 'SKU-CL2-005');

    -- Vitamins
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_2, category_vitamins, 'Multivitamins + Iron', 'Multivitamins, Iron', 'Stresstabs', 'Tablet', 'Standard', 180, 40, 7.00, 14.00, 'Section 3', 'SKU-CL2-006'),
    (clinic_id_2, category_vitamins, 'Calcium + Vitamin D', 'Calcium, Vitamin D', 'Caltrate', 'Tablet', '600mg/400IU', 100, 30, 8.00, 16.00, 'Section 3', 'SKU-CL2-007');

    -- Contraceptives
    INSERT INTO inventory_items (clinic_id, product_category_id, item_name, generic_name, brand_name, dosage_form, strength, quantity_on_hand, reorder_level, purchase_price, selling_price, location, sku) VALUES
    (clinic_id_2, category_contraceptives, 'Oral Contraceptive Pills - 28-day pack', 'Drospirenone + Ethinylestradiol', 'Yaz', 'Pill', '3mg/0.02mg', 60, 15, 280.00, 500.00, 'Section 4', 'SKU-CL2-008'),
    (clinic_id_2, category_contraceptives, 'Hormonal IUD', 'Levonorgestrel-releasing intrauterine system', 'Mirena', 'IUD', '52mg', 10, 2, 8000.00, 15000.00, 'Section 4', 'SKU-CL2-009'),
    (clinic_id_2, category_contraceptives, 'Condoms - 12 pack', 'Latex', 'Durex', 'Condom', 'N/A', 100, 20, 150.00, 250.00, 'Section 4', 'SKU-CL2-010');

END $$; 