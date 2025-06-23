import { db } from '../../db/drizzle';
import { suppliers } from '../../db/schema';
import { CreateSupplierInput, UpdateSupplierInput } from './inventory.validation';
import { ApiError } from '../../lib/errors';
import { eq } from 'drizzle-orm';

export const inventoryService = {
  async createSupplier(data: CreateSupplierInput) {
    const [newSupplier] = await db.insert(suppliers).values(data).returning();
    return newSupplier;
  },

  async getAllSuppliers() {
    const result = await db.select().from(suppliers);
    return result;
  },

  async getSupplierById(id: string) {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    if (!supplier) {
      throw new ApiError(404, `Supplier with id ${id} not found`);
    }
    return supplier;
  },

  async updateSupplier(id: string, data: UpdateSupplierInput) {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.id, id))
      .returning();

    if (!updatedSupplier) {
      throw new ApiError(404, `Supplier with id ${id} not found`);
    }
    return updatedSupplier;
  },

  async deleteSupplier(id: string) {
    const [deletedSupplier] = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    if (!deletedSupplier) {
      throw new ApiError(404, `Supplier with id ${id} not found`);
    }
    return deletedSupplier;
  },
}; 