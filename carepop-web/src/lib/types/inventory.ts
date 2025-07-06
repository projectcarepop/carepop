// Single source of truth for all inventory-related types.

export interface InventoryItem {
  id: string;
  clinicId: string;
  itemName: string;
  productCategoryId: string | null;
  sku: string | null;
  genericName: string | null;
  brandName: string | null;
  dosageForm: string | null;
  strength: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  purchasePrice: number | null;
  sellingPrice: number | null;
  location: string | null;
  updatedAt: string;
  // This is the shape of the joined data from the backend
  categoryName?: string;
}

export type InventoryItemBatch = {
  id: string;
  itemId: string;
  batchNumber?: string | null;
  quantity: number;
  expiryDate: string; // ISO String
  createdAt: string;
};

export interface ProductCategory {
  id:string;
  name: string;
  description?: string | null;
}

export type Clinic = {
  id: string;
  name: string;
  // Add other clinic properties as needed
}; 