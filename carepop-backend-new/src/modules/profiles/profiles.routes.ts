import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { profilesService } from './profiles.service';
import { updateProfileSchema } from './profiles.validation';
import { clerkAuthMiddleware, getAuth } from '../../middleware/auth.middleware';
import { ApiError } from '../../lib/errors';

const profilesRoutes = new Hono()
  .post(
    '/',
    zValidator('json', updateProfileSchema),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            throw new ApiError(401, 'User not authenticated');
        }
        const validatedJson = c.req.valid('json');
        const profile = await profilesService.upsertProfile(auth.userId, validatedJson);
        return c.json(profile, 201); // 201 Created or 200 OK is fine.
    }
  )
  .get('/', async (c) => {
    // This could be an admin-only route in the future
    return c.json({ message: 'GET all profiles placeholder' });
  })
  .get('/me', clerkAuthMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new ApiError(401, 'User not authenticated');
    }
    const profile = await profilesService.getProfile(auth.userId);
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }
    return c.json(profile);
  })
  .patch(
    '/me',
    clerkAuthMiddleware(),
    zValidator('json', updateProfileSchema),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      const validatedJson = c.req.valid('json');
      const updatedProfile = await profilesService.upsertProfile(
        auth.userId,
        validatedJson
      );
      return c.json(updatedProfile);
    }
  );

export { profilesRoutes }; 