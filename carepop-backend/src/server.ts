import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabaseInitializationPromise } from './config/supabaseClient';
import morgan from 'morgan';
import helmet from 'helmet';
import { errorHandler } from './lib/middleware/error.middleware';
import { getConfig } from './config/config';

// Publicly accessible routes
import authRoutes from './routes/public/auth.routes';
import publicRoutes from './routes/public';

// Consolidated Admin Routes
import adminRoutes from './routes/admin';

// Global Error Handler
import { AppError } from './lib/utils/appError';

const app: Express = express();
const config = getConfig();

// --- Pre-router Middleware ---
app.use(helmet());

// Configure CORS
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    process.env.FRONTEND_URL || ''
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- Health Check ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy' });
});

// --- Core Middleware ---
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
    app.use('/api/v1/public/auth', authRoutes); // Mount auth routes
    app.use('/api/v1/public', publicRoutes); // All other public data routes
    app.use('/api/v1/admin', adminRoutes); // All protected admin routes
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