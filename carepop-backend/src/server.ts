import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabase, supabaseServiceRole } from './config/supabaseClient';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app: Express = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}));
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
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  if (!supabase) {
    logger.warn('Supabase client might not be initialized yet (import timing issue?).');
  } else {
    logger.info('Supabase client appears initialized.');
  }
  const envType = process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT ? 'GCP' : 'Local';
  logger.info(`Running in environment: ${envType}`);
}); 