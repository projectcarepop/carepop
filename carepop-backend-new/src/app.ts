import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profiles/profiles.routes';
import errorHandler from './middleware/error.middleware';

const app = new Hono().basePath('/api/v1');

// --- Middleware ---
app.use('*', logger());
// Apply CORS to all routes
app.use(
  '*',
  cors({
    origin: '*', // In production, you should restrict this to your frontend's domain
  })
);

// --- Routes ---
app.get('/', (c) => {
  return c.text('CarePoP API is running!');
});

// Auth routes are public and do not need auth middleware
app.route('/auth', authRoutes);

// Profile routes are protected and require a valid token
app.route('/profiles', profileRoutes);

// --- Error Handler ---
app.onError(errorHandler);

export default app; 