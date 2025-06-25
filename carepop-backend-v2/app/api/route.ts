import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';

import publicRoutes from './modules/public.routes';
import meRoutes from './modules/me.routes';
import adminRoutes from './modules/admin.routes';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

// VITAL: CORS middleware applied globally and early
app.use('*', cors({
  origin: [
    'http://localhost:3000', // Your Next.js frontend development origin
    // Add your production frontend URL here when you deploy
  ],
  allowHeaders: [
    'Authorization',
    'Content-Type',
    // Add any other custom headers your frontend might send
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure PUT is here!
  credentials: true,
  maxAge: 86400, // Optional: How long the preflight response can be cached (in seconds)
}));

// Mount the modular routes
app.route('/public', publicRoutes);
app.route('/me', meRoutes);
app.route('/admin', adminRoutes);

// This type is now defined in the shared SDK
export type AppType = typeof app;

export { app };

// Export handlers for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
