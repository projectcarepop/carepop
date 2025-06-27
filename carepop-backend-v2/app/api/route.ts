import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';

import publicRoutes from './modules/public.routes';
import meRoutes from './modules/me.routes';
import adminRoutes from './modules/admin.routes';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

// --- DYNAMIC CORS CONFIGURATION FOR VERCEL ---
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.carepop.online',
  'https://carepop.online',
  'https://carepop.vercel.app'
];

app.use('*', cors({
  origin: (origin, c) => {
    // Allow requests from Vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      return origin;
    }
    // Allow requests from the defined list
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    // Block all other origins by returning null
    return null;
  },
  allowHeaders: [
    'Authorization',
    'Content-Type',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 86400,
}));

// Mount the modular routes
app.route('/public', publicRoutes);
app.route('/me', meRoutes);
app.route('/admin', adminRoutes);

// ========= TEMPORARY DEBUGGING ROUTE =========
app.get('/test-profile-update', async (c) => {
  console.log("--- RUNNING PROFILE UPDATE TEST ---");

  // Replace with the token you generated from the SQL Editor
  const TEST_USER_JWT = "PASTE_YOUR_LONG_JWT_STRING_HERE";

  const profileUpdatePayload = {
    firstName: "InternalTest",
    lastName: "Success"
  };

  // The 'app' object can dispatch requests to itself.
  // We are simulating a client hitting our own API internally.
  const res = await app.request('/api/me/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TEST_USER_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileUpdatePayload)
  });

  const responseBody = await res.text();
  console.log(`--- TEST COMPLETE ---`);
  console.log(`Status: ${res.status}`);
  console.log(`Response Body: ${responseBody}`);

  return c.text(`Test complete. Check your backend terminal logs. Status: ${res.status}`);
});
// ========= END OF TEMPORARY DEBUGGING ROUTE =========

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
