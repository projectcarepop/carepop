import { Hono } from 'hono';
import { clerkAuthMiddleware, getAuth } from '../../middleware/auth.middleware';
// import { validate } from '../../middleware/validate.middleware'; // Will create this next
import { createHealthEntrySchema } from './health.validation';
import { healthService } from './health.service';
import { z } from 'zod';

const app = new Hono();

// We will need a validation middleware for Hono. Let's assume one exists for now.
// For example, using `zod-validator` from `@hono/zod-validator`
import { zValidator } from '@hono/zod-validator';


// Route to create a new health entry
app.post(
  '/',
  clerkAuthMiddleware(),
  zValidator('json', createHealthEntrySchema),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const body = c.req.valid('json');
    // Transform snake_case from body to camelCase for the service
    const result = await healthService.createEntry(auth.userId, {
      entryType: body.entry_type,
      status: body.status,
      value: body.value,
      details: body.details,
      entryDate: body.entry_date,
    });
    return c.json(result, 201);
  }
);

// Route to get health entries for a user by type
const entryTypeSchema = z.enum(['pill', 'mood', 'menstrual_cycle']);
app.get(
  '/:entryType',
  clerkAuthMiddleware(),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const entryTypeParam = c.req.param('entryType');
    const parsedEntryType = entryTypeSchema.safeParse(entryTypeParam);

    if (!parsedEntryType.success) {
        return c.json({ error: 'Invalid entry type' }, 400);
    }
    
    const entries = await healthService.getEntries(auth.userId, parsedEntryType.data);
    return c.json(entries);
  }
);

// Route to get AI-powered insights
app.get(
    '/insights',
    clerkAuthMiddleware(),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const insights = await healthService.getInsights(auth.userId);
        return c.json(insights);
    }
);

export default app; 