import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { mobileService } from './mobile.service';
import { getAuth } from '../../middleware/auth.middleware';
import { updateProfileSchema } from '../profiles/profiles.validation';

const mobileRoutes = new Hono();

// This route is for a user completing their own profile from the mobile app.
mobileRoutes.put(
  '/me/complete-profile',
  zValidator('json', updateProfileSchema),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const validatedData = c.req.valid('json');
    const result = await mobileService.completeMobileUserProfile(
      auth.userId,
      validatedData
    );
    return c.json(result);
  }
);

export default mobileRoutes; 