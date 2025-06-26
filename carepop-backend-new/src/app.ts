import 'dotenv/config';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { clerkAuthMiddleware, roleAuthorization } from './middleware/auth.middleware';
import errorHandler from './middleware/error.middleware';

// --- Route Imports (Corrected based on error logs) ---
import authRoutes from './modules/auth/auth.routes';
import { profilesRoutes } from './modules/profiles/profiles.routes'; // This one is named
import usersRoutes from './modules/users/users.routes';
import clinicRoutes from './modules/clinics/clinics.routes';
import mobileRoutes from './modules/mobile/mobile.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import services from './modules/services/services.routes';
import health from './modules/health/health.routes';
import healthLogsRoutes from './modules/health/health-logs.routes';
import providers from './modules/providers/providers.routes';
import serviceCategories from './modules/service-categories/service-categories.routes';
import { adminInventoryRoutes } from './modules/inventory/inventory.routes';

const app = new Hono();

// --- Middleware ---
app.use('*', logger());
app.use('*', secureHeaders());

// Get allowed origins from environment variable, split by comma.
// Fallback to an empty string if the variable is not set.
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean);

app.use(
  '*',
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true,
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
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
protectedApi.route('/appointments', appointmentsRoutes);
protectedApi.route('/services', services);
protectedApi.route('/health', health);
protectedApi.route('/health-logs', healthLogsRoutes);
protectedApi.route('/providers', providers);
protectedApi.route('/service-categories', serviceCategories);

// --- Admin-Only Routes ---
// These routes are protected and require an 'admin' role
const adminApi = new Hono();
// Chain the middlewares: first authenticate, then check for admin role.
adminApi.use('*', clerkAuthMiddleware(), roleAuthorization('admin'));
adminApi.route('/inventory', adminInventoryRoutes);
protectedApi.route('/admin', adminApi); // Register admin routes under /admin prefix

apiV1.route('/', protectedApi);

// Register the v1 API router to the main app
app.route('/api/v1', apiV1);

// --- Error Handler ---
app.onError(errorHandler);

export default app;