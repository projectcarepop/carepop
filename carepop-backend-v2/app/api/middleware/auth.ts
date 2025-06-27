import { createMiddleware } from 'hono/factory';
import { createClient, User, SupabaseClient } from '@supabase/supabase-js';

// Define the type for Hono's context variables
export type AuthEnv = {
  Variables: {
    user: User;
    supabase: SupabaseClient;
  };
};

/**
 * Middleware to authenticate requests using a JWT from the Authorization header.
 * This is the correct approach for a stateless backend service like Hono on Vercel.
 * It does not and should not interact with cookies.
 */
export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  // 1. Initialize the Supabase client WITHIN the middleware.
  //    This uses the SERVICE_ROLE_KEY for admin-level access to validate tokens.
  //    These variables must be set in your Vercel environment for the backend service.
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 2. Get the token from the Authorization header.
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Bearer token is missing or malformed' }, 401);
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ error: 'Unauthorized', message: 'Token is missing' }, 401);
  }

  // 3. Validate the token to get the user.
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    console.error("Auth middleware error:", error?.message);
    return c.json({ error: 'Unauthorized', message: 'Invalid token or user not found' }, 401);
  }

  // 4. Set the user and the supabase client in the context and proceed.
  c.set('user', data.user);
  c.set('supabase', supabase);
  await next();
});

/**
 * Middleware to ensure the authenticated user has the 'admin' role.
 * This should run *after* authMiddleware.
 */
export const adminMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    // This case should theoretically not be hit if authMiddleware runs first,
    // but it's good practice for defense-in-depth.
    return c.json({ error: 'Forbidden', message: 'Authentication required' }, 403);
  }

  // The CORRECT and SECURE way to check roles for a backend service.
  // The JWT can be stale. Always query the database for the authoritative role.
  const supabase = c.get('supabase'); // Get client from context instead of creating a new one

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('Error fetching user profile for admin check:', error?.message);
    return c.json({ error: 'Forbidden', message: 'Could not verify user role.' }, 403);
  }

  if (profile.role !== 'admin') {
    return c.json({ error: 'Forbidden', message: 'Admin access required' }, 403);
  }

  await next();
});