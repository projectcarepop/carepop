export interface IInventoryItem {
  id: string;
  item_name: string;
  generic_name?: string | null;
  brand_name?: string | null;
  category?: string | null;
  drug_classification?: string | null;
  form?: string | null;
  strength_dosage?: string | null;
  packaging?: string | null;
  sku?: string | null;
  quantity_on_hand: number;
  reorder_level?: number | null;
  reorder_quantity?: number | null;
  min_stock_level?: number | null;
  max_stock_level?: number | null;
  purchase_cost?: number | null;
  selling_price?: number | null;
  is_active: boolean;
  supplier_id?: string | null;
  storage_requirements?: string | null;
  fda_registration_number?: string | null;
  controlled_substance_code?: string | null;
  prescription_requirement?: string | null;
  created_at: string;
  updated_at: string;
} 