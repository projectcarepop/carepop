import { Hono } from 'hono';
import { clerkAuthMiddleware, getAuth } from '../../middleware/auth.middleware';
import { HealthLogService } from './health-logs.service';
import { zValidator } from '@hono/zod-validator';
import { createHealthLogSchema, getHealthLogsSchema } from './health.validation';

const app = new Hono();

const healthLogService = new HealthLogService();

// Create a new health log
app.post(
  '/',
  clerkAuthMiddleware(),
  zValidator('json', createHealthLogSchema.shape.body),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const logData = c.req.valid('json');
    const newLog = await healthLogService.createHealthLog(auth.userId, logData);
    return c.json(newLog, 201);
  }
);

// Get health logs for the authenticated user
app.get(
  '/',
  clerkAuthMiddleware(),
  zValidator('query', getHealthLogsSchema.shape.query),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const queryParams = c.req.valid('query');
    const logs = await healthLogService.getHealthLogs(auth.userId, queryParams);
    return c.json(logs);
  }
);

// Get AI-powered analysis
app.post('/analyze', clerkAuthMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const analysis = await healthLogService.getAnalysis(auth.userId);
  return c.json(analysis);
});

export default app; 