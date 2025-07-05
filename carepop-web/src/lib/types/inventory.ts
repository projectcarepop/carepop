// Single source of truth for all inventory-related types.

export type InventoryItem = {
  id: string;
  clinicId: string;
  itemName: string;
  productCategoryId: string | null;
  sku?: string | null;
  genericName?: string | null;
  brandName?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  purchasePrice?: number | null;
  sellingPrice?: number | null;
  location?: string | null;
  updatedAt: string;
  // This is the shape of the joined data from the backend
  productCategory?: {
    name: string;
  } | null;
};

export type InventoryItemBatch = {
  id: string;
  inventoryItemId: string;
  batchNumber?: string | null;
  quantity: number;
  expiryDate: string; // ISO String
  createdAt: string;
};

export type ProductCategory = {
  id:string;
  name: string;
  description?: string | null;
};

export type Clinic = {
  id: string;
  name: string;
  // Add other clinic properties as needed
}; 