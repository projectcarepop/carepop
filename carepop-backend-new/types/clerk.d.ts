// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Hono } from 'hono';

declare module '@hono/clerk-auth' {
  interface CustomJwtSessionClaims {
    publicMetadata: {
      role?: 'admin' | 'user';
    };
  }
} 