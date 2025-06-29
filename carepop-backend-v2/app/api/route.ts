import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';

import publicRoutes from './modules/public.routes';
import meRoutes from './modules/me.routes';
import adminRoutes from './modules/admin.routes';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

// ========= TEMPORARY DIAGNOSTIC ECHO ENDPOINT =========
// This MUST be placed BEFORE the global CORS middleware.
app.get('/debug/headers', (c) => {
  console.log("--- DEBUG HEADERS ENDPOINT HIT ---");
  const requestHeaders = c.req.header();
  console.log("Received Headers:", requestHeaders);

  // Return the headers as JSON, with a completely open CORS policy FOR THIS ROUTE ONLY.
  return c.json({
    message: "These are the headers received by the Hono backend.",
    headers: requestHeaders,
    // Vercel-specific headers can also be useful for debugging
    vercelForwardedHost: c.req.header('x-forwarded-host'),
    vercelDeploymentUrl: c.req.header('x-vercel-deployment-url')
  }, 200, {
    'Access-Control-Allow-Origin': '*', // Allow ANY origin for this debug route
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  });
});
// ========= END OF TEMPORARY DIAGNOSTIC ENDPOINT =========

// --- ROBUST DYNAMIC CORS CONFIGURATION FOR VERCEL ---
app.use('*', cors({
  origin: (origin) => {
    // Define your static list of allowed production and development origins
    const allowed = [
      'http://localhost:3000',
      'https://www.carepop.online'
    ];

    // Define a regular expression to match your Vercel preview deployments
    // It matches URLs like https://carepop-web-a1b2c3d.vercel.app
    const vercelPreviewPattern = /^https:\/\/carepop-web-.*\.vercel\.app$/;

    // Check if the incoming origin is in our static list OR matches the preview pattern
    if (allowed.includes(origin) || vercelPreviewPattern.test(origin)) {
      // If it matches, allow it by returning the origin string.
      return origin;
    }
    
    // For all other origins, block the request.
    return undefined; 
  },
  allowHeaders: [
    'Authorization',
    'Content-Type',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 86400, // Cache preflight response for 1 day
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
