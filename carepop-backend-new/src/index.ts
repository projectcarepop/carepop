import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app';
import { env } from './config';

const port = parseInt(env.PORT, 10);

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
}); 