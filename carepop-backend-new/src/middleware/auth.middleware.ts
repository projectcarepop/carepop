// This file will contain the middleware to verify JWTs and check user roles.

import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { type MiddlewareHandler } from 'hono';
import { ApiError } from '../lib/errors';

// Re-export getAuth for convenience in other parts of the app
export { getAuth };

// This is the main authentication middleware provided by Hono's Clerk package.
export const clerkAuthMiddleware = clerkMiddleware;

// This is a new middleware for role-based authorization.
// It should be used *after* the clerkAuthMiddleware.
export const roleAuthorization = (
  requiredRole: 'admin'
): MiddlewareHandler => {
  return async (c, next) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      throw new ApiError(401, 'Unauthorized: You must be logged in.');
    }

    if (
      (auth.sessionClaims?.metadata as { role?: string })?.role !==
      requiredRole
    ) {
      throw new ApiError(403, 'Forbidden: Insufficient privileges.');
    }

    await next();
  };
};

export {}; // Placeholder to make this a module 