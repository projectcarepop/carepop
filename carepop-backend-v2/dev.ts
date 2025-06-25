import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app/api/route';

console.log('Starting dev server on http://localhost:8000');

serve({
  fetch: app.fetch,
  port: 8000,
}); 