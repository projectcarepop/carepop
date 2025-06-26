import { createMiddleware } from 'hono/factory';
import { createClient, User } from '@supabase/supabase-js';

// Define the type for Hono's context variables
export type AuthEnv = {
  Variables: {
    user: User;
  };
};

// Initialize Supabase client
// These variables should be set in your Vercel environment
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Middleware to authenticate requests using a JWT from the Authorization header.
 */
export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Bearer token is missing or malformed' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ error: 'Unauthorized', message: 'Token is missing' }, 401);
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ error: 'Unauthorized', message: 'Invalid token or user not found' }, 401);
  }

  c.set('user', data.user);
  await next();
});

/**
 * Middleware to ensure the authenticated user has the 'admin' role.
 * This should run *after* authMiddleware.
 */
export const adminMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Forbidden', message: 'Authentication required' }, 403);
  }

  // --- DEBUGGING: Log the metadata to see what the backend receives ---
  console.log('Admin Middleware Check: User metadata received:', user.user_metadata);

  if (user.user_metadata?.role !== 'admin') {
    return c.json({ error: 'Forbidden', message: 'Admin access required' }, 403);
  }

  await next();
});
