-- Seed data for suppliers and inventory_items

-- Clear existing data to prevent duplicates on re-seeding
DELETE FROM inventory_items;
DELETE FROM suppliers;

-- Seed Suppliers
INSERT INTO suppliers (id, name, contact_person, contact_email, contact_phone, address, is_active) VALUES
(gen_random_uuid(), 'Metro Drug Inc.', 'Juan dela Cruz', 'juan.delacruz@metrodrug.com', '+639171234567', '123 Ayala Ave, Makati, Metro Manila', true),
(gen_random_uuid(), 'Zuellig Pharma', 'Maria Santos', 'maria.santos@zuelligpharma.com', '+639187654321', '456 Shaw Blvd, Mandaluyong, Metro Manila', true),
(gen_random_uuid(), 'GB-A Pharma', 'Jose Rizal', 'jose.rizal@gbapharma.com', '+639201112233', '789 EDSA, Quezon City, Metro Manila', true),
(gen_random_uuid(), 'Phil-RX Supplies', 'Andres Bonifacio', 'andres.bonifacio@philrx.com', '+639223334455', '101 Bonifacio High Street, Taguig, Metro Manila', false);

-- Seed Inventory Items
-- Note: This assumes you have supplier UUIDs. For this script, we'll need to fetch them.
-- To keep this script self-contained and runnable, we'll select a supplier's ID directly.
DO $$
DECLARE
    metro_drug_id uuid;
    zuellig_pharma_id uuid;
    gba_pharma_id uuid;
BEGIN
    SELECT id INTO metro_drug_id FROM suppliers WHERE name = 'Metro Drug Inc.';
    SELECT id INTO zuellig_pharma_id FROM suppliers WHERE name = 'Zuellig Pharma';
    SELECT id INTO gba_pharma_id FROM suppliers WHERE name = 'GB-A Pharma';

    INSERT INTO inventory_items (id, item_name, generic_name, brand_name, category, drug_classification, form, strength_dosage, packaging, sku, quantity_on_hand, reorder_level, purchase_cost, selling_price, is_active, supplier_id) VALUES
    (gen_random_uuid(), 'Paracetamol 500mg Tablet', 'Paracetamol', 'Biogesic', 'Pain Reliever', 'Analgesic', 'Tablet', '500mg', 'Box of 100', 'SKU-BI001', 500, 50, 2.50, 5.00, true, metro_drug_id),
    (gen_random_uuid(), 'Amoxicillin 500mg Capsule', 'Amoxicillin', 'Amoxil', 'Antibiotic', 'Penicillin', 'Capsule', '500mg', 'Box of 100', 'SKU-AMX001', 300, 30, 8.00, 15.00, true, zuellig_pharma_id),
    (gen_random_uuid(), 'Loratadine 10mg Tablet', 'Loratadine', 'Claritin', 'Anti-allergy', 'Antihistamine', 'Tablet', '10mg', 'Box of 50', 'SKU-CLA001', 150, 20, 15.00, 25.00, true, gba_pharma_id),
    (gen_random_uuid(), 'Ascorbic Acid 500mg Tablet', 'Ascorbic Acid', 'Cecon', 'Vitamin', 'Vitamin C', 'Tablet', '500mg', 'Bottle of 100', 'SKU-CEC001', 800, 100, 1.50, 3.00, true, metro_drug_id),
    (gen_random_uuid(), 'Ibuprofen 200mg Tablet', 'Ibuprofen', 'Advil', 'Pain Reliever', 'NSAID', 'Tablet', '200mg', 'Box of 100', 'SKU-ADV001', 250, 40, 5.00, 9.00, true, zuellig_pharma_id);
END $$; 