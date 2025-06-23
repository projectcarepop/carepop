import { Hono } from 'hono';
import { clerkAuthMiddleware, getAuth } from '../../middleware/auth.middleware';
import { HealthService } from './health.service';
import { zValidator } from '@hono/zod-validator';
import { createHealthEntrySchema } from './health.validation';

const app = new Hono();

const healthService = new HealthService();

// GET /api/v1/health/status/today - Fast status for dashboard
app.get('/status/today', clerkAuthMiddleware(), async c => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const status = await healthService.getTodayStatus(auth.userId);
  return c.json(status);
});

// GET /api/v1/health/summary - Detailed summary for health buddy screen
app.get('/summary', clerkAuthMiddleware(), async c => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const summary = await healthService.getHealthSummary(auth.userId);
  return c.json(summary);
});

// POST /api/v1/health/entry - Log new health data
app.post(
  '/entry',
  clerkAuthMiddleware(),
  zValidator('json', createHealthEntrySchema),
  async c => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const entryData = c.req.valid('json');
    
    // The schema validation ensures entry_type is one of the allowed values
    const result = await healthService.createEntry(auth.userId, entryData as any);
    return c.json(result, 201);
  }
);

// This is a placeholder and doesn't do anything yet.
app.get('/insights', clerkAuthMiddleware(), async c => {
    return c.json({ message: 'Insights are coming soon!' });
});

export default app; 