import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { inventoryService } from './inventory.service';
import { createSupplierSchema, updateSupplierSchema } from './inventory.validation';

export const adminInventoryRoutes = new Hono();

// POST /api/v1/admin/suppliers - Create a new supplier
adminInventoryRoutes.post(
  '/suppliers',
  zValidator('json', createSupplierSchema),
  async (c) => {
    const supplierData = c.req.valid('json');
    const newSupplier = await inventoryService.createSupplier(supplierData);
    return c.json(newSupplier, 201);
  }
);

// GET /api/v1/admin/suppliers - Get all suppliers
adminInventoryRoutes.get('/suppliers', async (c) => {
  const suppliers = await inventoryService.getAllSuppliers();
  return c.json(suppliers);
});

// GET /api/v1/admin/suppliers/:id - Get a single supplier
adminInventoryRoutes.get('/suppliers/:id', async (c) => {
  const { id } = c.req.param();
  const supplier = await inventoryService.getSupplierById(id);
  return c.json(supplier);
});

// PATCH /api/v1/admin/suppliers/:id - Update a supplier
adminInventoryRoutes.patch(
  '/suppliers/:id',
  zValidator('json', updateSupplierSchema),
  async (c) => {
    const { id } = c.req.param();
    const supplierData = c.req.valid('json');
    const updatedSupplier = await inventoryService.updateSupplier(id, supplierData);
    return c.json(updatedSupplier);
  }
);

// DELETE /api/v1/admin/suppliers/:id - Delete a supplier
adminInventoryRoutes.delete('/suppliers/:id', async (c) => {
  const { id } = c.req.param();
  await inventoryService.deleteSupplier(id);
  return c.json({ message: 'Supplier deleted successfully' }, 200);
}); 