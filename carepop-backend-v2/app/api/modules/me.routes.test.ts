import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import meRoutes from './me.routes';
import type { User } from '@supabase/supabase-js';
import { db } from '../lib/db';
import type { AuthEnv } from '../middleware/auth';

// --- Mock the Middleware File ---
// This replaces the REAL middleware with a FAKE one for our tests.
vi.mock('../middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    // In our tests, we will manually set c.var.user to simulate a logged-in user.
    // If it's not set by a test, our fake middleware will block the request.
    if (c.var.user) {
      return next();
    }
    return c.json({ error: 'Unauthorized from mock' }, 401);
  }),
  // We don't need to test admin logic here, so it can be a simple pass-through.
  adminMiddleware: vi.fn((c, next) => next()),
}));

// --- Mock the Database library ---
vi.mock('../lib/db', () => ({
    db: {
      query: {
        appointments: {
          findMany: vi.fn().mockResolvedValue([{ id: 'appt-123', reason: 'Checkup' }]),
        },
        healthLogs: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'new-appt-456' }]),
    },
}));

// --- Mock User Data ---
const mockPatientUser: User = {
  id: 'a-patient-uuid',
  app_metadata: { role: 'patient' },
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

describe('Patient API Routes (me.routes)', () => {

  it('Should return 401 Unauthorized if no user context is provided', async () => {
    // Act: We call the routes directly. Our mock middleware will not find a user in the context.
    const res = await meRoutes.request('/appointments');
    // Assert
    expect(res.status).toBe(401);
  });

  it('GET /appointments should return 200 OK for an authenticated patient', async () => {
    // Arrange: Create a new Hono app with the correct context type for this test
    const app = new Hono<AuthEnv>().use('*', (c, next) => {
      c.set('user', mockPatientUser);
      return next();
    }).route('/me', meRoutes);

    // Act
    const res = await app.request('/me/appointments');

    // Assert
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].id).toBe('appt-123');
  });

  it('POST /appointments should return 201 Created for an authenticated patient', async () => {
    // Arrange
    const app = new Hono<AuthEnv>().use('*', (c, next) => {
      c.set('user', mockPatientUser);
      return next();
    }).route('/me', meRoutes);

    const validAppointment = {
        doctorId: 'd8da6ea5-72f8-4f57-9626-4e582b13214a',
        serviceId: 'e9a4407a-2c49-49d3-9dd1-5b5e1a38c3ea',
        clinicId: 'f0b5f8c1-6f4a-4c2a-9c7d-8e1e3b2a1b0c',
        appointmentTime: new Date().toISOString(),
    };

    // Act
    const res = await app.request('/me/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validAppointment),
    });

    // Assert
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('new-appt-456');
  });
}); 