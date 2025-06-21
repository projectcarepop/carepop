// This file will contain the middleware to verify JWTs and check user roles.

import { type MiddlewareHandler } from 'hono';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { env } from '../config';
import { ApiError } from '../lib/errors';

// Initialize the Clerk client
const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

// Define a new shape for our Hono context's variables
// We'll store the authenticated user's claims here.
export type AuthContext = {
  Variables: {
    auth: {
      userId: string;
      sessionId: string;
      claims: Record<string, any>;
    };
  };
};

// This middleware creates a Supabase client for each request,
// gets the current user's session, and sets it in the context
// for other routes to use.
export const authMiddleware = (): MiddlewareHandler<AuthContext> => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        throw new ApiError(401, 'Unauthorized: Missing token.');
    }

    try {
      const claims = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
      
      c.set('auth', {
        sessionId: claims.sid,
        userId: claims.sub,
        claims: claims,
      });

    } catch (e: any) {
      console.error('Clerk authentication error:', e.message);
      throw new ApiError(401, 'Unauthorized: Invalid token.');
    }

    await next();
  };
};

// This is a new middleware for role-based authorization.
// It should be used *after* the authMiddleware.
export const roleAuthorization = (
  requiredRole: 'admin'
): MiddlewareHandler<AuthContext> => {
  return async (c, next) => {
    const { claims } = c.get('auth');

    // In Clerk, roles are stored in public metadata.
    if (claims.public_metadata?.role !== requiredRole) {
      throw new ApiError(403, 'Forbidden: Insufficient privileges.');
    }

    await next();
  };
};

export {}; // Placeholder to make this a module 