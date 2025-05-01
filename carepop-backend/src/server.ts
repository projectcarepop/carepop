import express, { Express, Request, Response, NextFunction } from 'express';
import logger from './utils/logger';
import { supabase } from './config/supabaseClient'; // Ensure Supabase client initialization logic runs before server start
import authRoutes from './routes/authRoutes';

const PORT = process.env.PORT || 8080;
const app: Express = express();

// Middleware
app.use(express.json()); // Middleware to parse JSON bodies

// --- Mount Routers ---
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth

// --- Basic Routes (Optional) ---
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'CarePoP Backend API is running' });
});

// --- Centralized Error Handler (Placeholder) ---
// This should be defined *after* all routes and middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Error:', { 
    message: err.message, 
    stack: err.stack, 
    url: req.originalUrl, 
    method: req.method 
  });
  
  // Avoid sending detailed errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({ 
    success: false, 
    message: isProduction ? 'An internal server error occurred.' : err.message 
  });
});

// --- Start Server ---
async function startServer() {
  logger.info('Backend service starting...');

  // Simple check if supabase client seems available (initialization happens in its own module)
  if (!supabase) {
      logger.warn('Supabase client might not be initialized yet. Proceeding, but DB ops might fail initially.');
      // In a real app, might implement a more robust readiness check or delay start
  }

  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
    const envType = process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT ? 'GCP' : 'Local';
    logger.info(`Running in environment: ${envType}`);
  });
}

// Handle potential errors during top-level async operations
startServer().catch(error => {
  logger.error('Unhandled error during server startup:', error);
  process.exit(1);
}); 