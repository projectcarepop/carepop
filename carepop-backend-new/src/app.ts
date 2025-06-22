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
import clinicRoutes from './modules/clinics/clinics.routes';
import mobileRoutes from './modules/mobile/mobile.routes';
//import appointments from './modules/appointments/appointments.routes';
import services from './modules/services/services.routes';

const app = new Hono();

// --- Middleware ---
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: '*', // In production, you should restrict this to your frontend's domain
  })
);

// --- API v1 Router ---
const apiV1 = new Hono();

// --- Public Routes ---
// These routes do not require authentication
const publicApi = new Hono();
publicApi.get('/', (c) => c.text('CarePoP API is running!'));
publicApi.route('/auth', authRoutes); // e.g., for webhooks or login initiation
apiV1.route('/', publicApi);

// --- Protected Routes ---
// These routes are protected by the Clerk auth middleware
const protectedApi = new Hono();
protectedApi.use('*', clerkAuthMiddleware()); // Middleware applied only to this group
protectedApi.route('/users', usersRoutes);
protectedApi.route('/profiles', profilesRoutes);
protectedApi.route('/clinics', clinicRoutes);
protectedApi.route('/mobile', mobileRoutes);
//protectedApi.route('/appointments', appointments);
protectedApi.route('/services', services);
apiV1.route('/', protectedApi);

// Register the v1 API router to the main app
app.route('/api/v1', apiV1);

// --- Error Handler ---
app.onError(errorHandler);

export default app;