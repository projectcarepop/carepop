// This file will contain the middleware to verify JWTs and check user roles.

import { type MiddlewareHandler } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config';
import { ApiError } from '../lib/errors';
import { type User } from '@supabase/supabase-js';

// Define a new shape for our Hono context's variables
export type AppContext = {
  Variables: {
    user: User;
  };
};

// This middleware creates a Supabase client for each request,
// gets the current user's session, and sets it in the context
// for other routes to use.
export const authMiddleware = (
  requiredRole?: 'admin'
): MiddlewareHandler<AppContext> => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization header is missing or malformed.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Bearer token is missing.');
    }

    // Create a temporary Supabase client to validate the token
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new ApiError(401, 'Invalid token or user not found.');
    }

    // --- Authorization (Role Check) ---
    if (requiredRole) {
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError || !userRole || userRole.role !== requiredRole) {
        throw new ApiError(403, 'Forbidden: Insufficient privileges.');
      }
    }

    c.set('user', data.user);
    await next();
  };
};

export {}; // Placeholder to make this a module 