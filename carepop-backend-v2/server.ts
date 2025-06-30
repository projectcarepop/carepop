// server.ts (Production Server Entrypoint)

import { serve } from '@hono/node-server';
import { app } from './app/api/route'; // Or your main Hono app instance path

// The port should come from an environment variable for flexibility in Cloud Run
const port = parseInt(process.env.PORT || '8000', 10);

console.log(`🚀 Production server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: port,
}); 