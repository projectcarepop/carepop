// Single source of truth for all inventory-related types.

export type InventoryItem = {
  id: string;
  clinicId: string;
  itemName: string;
  productCategoryId: string;
  sku?: string | null;
  genericName?: string | null;
  brandName?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  quantityInStock: number;
  reorderLevel: number;
  purchasePrice?: number | null;
  sellingPrice?: number | null;
  location?: string | null;
  description?: string | null;
  updatedAt: string;
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