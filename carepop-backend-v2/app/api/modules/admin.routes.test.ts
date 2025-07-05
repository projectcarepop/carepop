import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Hono } from 'hono';
import adminRoutes from './admin.routes';
import type { User } from '@supabase/supabase-js';
import { db } from '../lib/db';
import type { AuthEnv } from '../middleware/auth';

// --- Mock the Middleware File ---
vi.mock('../middleware/auth', () => ({
  // This fake middleware checks the context for a user.
  // It also respects the `failAuth` flag for specific tests.
  authMiddleware: vi.fn((c, next) => {
    if (c.var.failAuth) return c.json({ error: 'Unauthorized from mock' }, 401);
    if (c.var.user) return next();
    return c.json({ error: 'Unauthorized from mock' }, 401);
  }),
  // This fake middleware checks the role of the user set in the context.
  adminOrManagerMiddleware: vi.fn((c, next) => {
    const role = c.var.user?.app_metadata?.role;
    if (role === 'admin' || role === 'manager') {
      return next();
    }
    return c.json({ error: 'Forbidden from mock' }, 403);
  }),
}));

// --- Mock the Database library ---
vi.mock('../lib/db', () => ({
    db: {
      query: {
        profiles: { findMany: vi.fn() },
      },
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'new-clinic-123', name: 'New Test Clinic' }]),
      delete: vi.fn().mockReturnThis(),
      transaction: vi.fn(),
    },
}));

// --- Mock User Data ---
const mockPatientUser: Partial<User> = { id: 'patient-uuid', app_metadata: { role: 'patient' } };
const mockAdminUser: Partial<User> = { id: 'admin-uuid', app_metadata: { role: 'admin' } };


describe('Admin API Routes', () => {

  it('Should return 401 Unauthorized if no user is provided', async () => {
    const res = await adminRoutes.request('/users');
    expect(res.status).toBe(401);
  });

  it('Should return 403 Forbidden if a non-admin user tries to access', async () => {
    // Arrange: Create a test app that injects a PATIENT user into the context.
    const app = new Hono<AuthEnv>().use('*', (c, next) => {
      c.set('user', mockPatientUser as User);
      return next();
    }).route('/admin', adminRoutes);

    // Act
    const res = await app.request('/admin/users');

    // Assert: Our mock adminMiddleware should catch this and return 403.
    expect(res.status).toBe(403);
  });

  it('GET /users should return 200 OK for an admin user', async () => {
    // Arrange: Create a test app that injects an ADMIN user into the context.
    const app = new Hono<AuthEnv>().use('*', (c, next) => {
      c.set('user', mockAdminUser as User);
      return next();
    }).route('/admin', adminRoutes);

    // Act
    const res = await app.request('/admin/users');

    // Assert
    expect(res.status).toBe(200);
  });
});

describe('Admin Inventory API Routes', () => {
    const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        returning: vi.fn(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (db.transaction as Mock).mockImplementation(async (callback) => callback(mockTx));
    });

    const app = new Hono<AuthEnv>().use('*', (c, next) => {
        c.set('user', mockAdminUser as User);
        c.set('supabase', {} as any); // Mock supabase client if needed by other routes
        return next();
    }).route('/', adminRoutes);

    it('PUT /clinics/:clinicId/inventory/:itemId should log a manual_update to the audit log', async () => {
        mockTx.where.mockResolvedValueOnce([{ quantityOnHand: 100 }]);
        mockTx.returning.mockResolvedValueOnce([{ id: 'item-1', clinicId: 'clinic-1', quantityOnHand: 90 }]);

        const res = await app.request('/clinics/clinic-1/inventory/item-1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantityOnHand: 90 }),
        });

        expect(res.status).toBe(200);
        expect(db.transaction).toHaveBeenCalled();
        expect(mockTx.insert).toHaveBeenCalled();
        expect(mockTx.values).toHaveBeenCalledWith({
            itemId: 'item-1',
            clinicId: 'clinic-1',
            userId: mockAdminUser.id,
            changeType: 'manual_update',
            quantityChange: -10,
            oldQuantity: 100,
            newQuantity: 90,
            reason: 'Manual stock adjustment by user.',
        });
    });

    it('DELETE /clinics/:clinicId/inventory/:itemId should log a deletion to the audit log', async () => {
        mockTx.where.mockResolvedValueOnce([{ quantityOnHand: 50 }]);

        const res = await app.request('/clinics/clinic-1/inventory/item-1', {
            method: 'DELETE',
        });

        expect(res.status).toBe(200);
        expect(db.transaction).toHaveBeenCalled();
        expect(mockTx.delete).toHaveBeenCalled();
        expect(mockTx.insert).toHaveBeenCalled();
        expect(mockTx.values).toHaveBeenCalledWith({
            itemId: 'item-1',
            clinicId: 'clinic-1',
            userId: mockAdminUser.id,
            changeType: 'deletion',
            quantityChange: -50,
            oldQuantity: 50,
            newQuantity: 0,
            reason: 'Item deleted from inventory.',
        });
    });
}); 