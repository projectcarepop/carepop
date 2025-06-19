import { app, startServer } from '../src/server';
import logger from '../src/utils/logger';

// This is the main entry point for Vercel.
// It initializes the server and exports the Express app instance.

// We wrap the initialization in a promise to be awaited by Vercel.
// This ensures that `startServer` completes before the app instance is exported,
// and before any requests are handled. This initialization runs once per lambda instance.
const startPromise = startServer().then(() => {
  logger.info("Server initialized for Vercel. Exporting app.");
  return app;
}).catch(err => {
  logger.error("Vercel handler initialization failed:", err);
  // If initialization fails, we must exit to prevent Vercel from
  // trying to run a broken server instance.
  process.exit(1);
});

// Vercel will await this promise and then use the resulting `app`
// to handle incoming requests.
export default startPromise; 