import { describe, it, expect, vi } from 'vitest';
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
  adminMiddleware: vi.fn((c, next) => {
    if (c.var.user?.app_metadata?.role === 'admin') {
      return next();
    }
    return c.json({ error: 'Forbidden from mock' }, 403);
  }),
}));

// --- Mock the Database library ---
vi.mock('../lib/db', () => ({
    db: {
      query: {
        profiles: { findMany: vi.fn().mockResolvedValue([{ id: 'user-1', role: 'patient' }]) },
      },
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'new-clinic-123', name: 'New Test Clinic' }]),
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