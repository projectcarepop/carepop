import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabaseInitializationPromise } from './config/supabaseClient';

// Publicly accessible routes
import publicRoutes from './routes/public/index';

// Consolidated Admin Routes
// import adminRoutes from './routes/admin'; // Commenting out admin routes due to DI complexity

// Global Error Handler
import { errorHandler } from './lib/middleware/errorHandler';

import { getConfig } from './config/config';


const app: Express = express();
const config = getConfig();

// --- Health Check ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy' });
});

// --- Core Middleware ---
const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.path}`);
  next();
});

// --- Start Server Async ---
async function startServer() {
  try {
    await supabaseInitializationPromise;
    logger.info('Supabase clients initialized successfully by server.');

    // --- Mount Routers ---
    app.use('/api/v1', publicRoutes); // All public data routes
    // app.use('/api/v1/admin', adminRoutes); // All protected admin routes
    logger.info('API routes mounted.');
    
    // --- 404 Handler (for unhandled routes) ---
    app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Resource not found' });
    });

    // --- Centralized Error Handling (MUST be after all routes) ---
    app.use(errorHandler);
    logger.info('Centralized error handler mounted.');


    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server due to an initialization error:', error);
    process.exit(1);
  }
}

startServer();

export default app; 