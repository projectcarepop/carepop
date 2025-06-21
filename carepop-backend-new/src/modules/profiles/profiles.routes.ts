import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { profilesService } from './profiles.service';
import { updateProfileSchema } from './profiles.validation';
import { authMiddleware, type AuthContext } from '../../middleware/auth.middleware';

const profileRoutes = new Hono<AuthContext>();

// All routes in this module require authentication
profileRoutes.use('*', authMiddleware());

profileRoutes.get('/me', async (c) => {
  const { userId } = c.get('auth');
  const profile = await profilesService.getProfile(userId);
  return c.json(profile);
});

profileRoutes.put(
  '/me',
  zValidator('json', updateProfileSchema),
  async (c) => {
    const { userId } = c.get('auth');
    const validatedData = c.req.valid('json');
    const updatedProfile = await profilesService.updateProfile(userId, validatedData);
    return c.json(updatedProfile);
  }
);

export default profileRoutes; 