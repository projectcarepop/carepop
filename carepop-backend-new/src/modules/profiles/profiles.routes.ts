import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { profilesService } from './profiles.service';
import { updateProfileSchema } from './profiles.validation';
import { authMiddleware, type AppContext } from '../../middleware/auth.middleware';

const profileRoutes = new Hono<AppContext>();

// All routes in this module require authentication
profileRoutes.use('*', authMiddleware());

profileRoutes.get('/me', async (c) => {
  const user = c.var.user;
  const profile = await profilesService.getProfile(user.id);
  return c.json(profile);
});

profileRoutes.put(
  '/me',
  zValidator('json', updateProfileSchema),
  async (c) => {
    const user = c.var.user;
    const validatedData = c.req.valid('json');
    const updatedProfile = await profilesService.updateProfile(user.id, validatedData);
    return c.json(updatedProfile);
  }
);

export default profileRoutes; 