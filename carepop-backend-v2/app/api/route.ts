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
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Add PATCH here
  credentials: true,
  maxAge: 86400, // Optional: How long the preflight response can be cached (in seconds)
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
