import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { usersService } from './users.service';
import { updateUserSchema } from './users.validation';
import {
  clerkAuthMiddleware,
  roleAuthorization,
  getAuth,
} from '../../middleware/auth.middleware';
import { updateProfileSchema } from '../profiles/profiles.validation';

const usersRoutes = new Hono();

// This new route handles syncing a Clerk user with the local database.
// It's called after a user signs up or signs in for the first time.
usersRoutes.post('/sync', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // The sessionClaims object might be null, so we safely access properties.
  // We must cast the properties from `unknown` to `string | undefined` to match our service layer types.
  const userDetails = {
    email: auth.sessionClaims?.email as string | undefined,
    firstName: auth.sessionClaims?.firstName as string | undefined,
    lastName: auth.sessionClaims?.lastName as string | undefined,
    imageUrl: auth.sessionClaims?.imageUrl as string | undefined,
  };

  const result = await usersService.syncUser(auth.userId, userDetails);
  return c.json(result);
});

// This route is for a user to manage their own profile data.
// It is protected by the clerkAuthMiddleware in the main app.ts, but does NOT require admin role.
usersRoutes.put(
  '/me/complete-profile',
  zValidator('json', updateProfileSchema),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const validatedData = c.req.valid('json');
    const result = await usersService.completeUserProfile(
      auth.userId,
      validatedData
    );
    return c.json(result);
  }
);

// --- Admin-only routes ---
// These routes are for administrators to manage any user.
const adminUsersRoutes = new Hono();
adminUsersRoutes.use('*', roleAuthorization('admin')); // Ensure only admins can access these routes

// GET /api/v1/users - Fetches all users (admin only)
adminUsersRoutes.get('/', async (c) => {
  const users = await usersService.getAllUsers();
  return c.json(users);
});

// GET /api/v1/users/:id - Fetches a single user by ID (admin only)
adminUsersRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();
  const user = await usersService.getUserById(id);
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json(user);
});

// PATCH /api/v1/users/:id - Updates a user's role (admin only)
adminUsersRoutes.patch(
  '/:id',
  zValidator('json', updateUserSchema),
  async (c) => {
    const { id } = c.req.param();
    const validatedData = c.req.valid('json');

    const updatedUser = await usersService.updateUser(id, validatedData);
    return c.json(updatedUser);
  }
);

// DELETE /api/v1/users/:id - Deletes a user (admin only)
adminUsersRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const result = await usersService.deleteUser(id);
  return c.json(result);
});

// Mount the admin-only routes under the main users router
usersRoutes.route('/', adminUsersRoutes);

export default usersRoutes; 