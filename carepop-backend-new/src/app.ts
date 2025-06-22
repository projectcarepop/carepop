import 'dotenv/config';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { clerkAuthMiddleware } from './middleware/auth.middleware';
import errorHandler from './middleware/error.middleware';

// --- Route Imports (Corrected based on error logs) ---
import authRoutes from './modules/auth/auth.routes';
import { profilesRoutes } from './modules/profiles/profiles.routes'; // This one is named
import usersRoutes from './modules/users/users.routes';
import webhookRoutes from './modules/webhooks/webhooks.routes';
import clinicRoutes from './modules/clinics/clinics.routes';
import mobileRoutes from './modules/mobile/mobile.routes';

const app = new Hono().basePath('/api/v1');

// --- Middleware ---
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: '*', // In production, you should restrict this to your frontend's domain
  })
);
app.use('*', clerkAuthMiddleware());

// --- Public Routes ---
const publicRoutes = new Hono();
publicRoutes.get('/', (c) => {
  return c.text('CarePoP API is running!');
});
publicRoutes.route('/auth', authRoutes);
publicRoutes.route('/webhooks', webhookRoutes);
publicRoutes.route('/users', usersRoutes);
app.route('/', publicRoutes);

// --- Protected Routes ---
const protectedRoutes = new Hono();
protectedRoutes.route('/profiles', profilesRoutes);
protectedRoutes.route('/clinics', clinicRoutes);
protectedRoutes.route('/mobile', mobileRoutes);
app.route('/', protectedRoutes);

// --- Error Handler ---
app.onError(errorHandler);

export default app;