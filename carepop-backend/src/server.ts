import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabaseInitializationPromise } from './config/supabaseClient';
import morgan from 'morgan';
import helmet from 'helmet';
import { errorHandler } from './lib/middleware/error.middleware';
import { getConfig } from './config/config';

// Import route handlers
import publicRoutes from './routes/public';
import { adminRoutes } from './routes/admin';

// Global Error Handler
import { AppError } from './lib/utils/appError';

const app: Express = express();
const config = getConfig();

// --- Pre-router Middleware ---
app.use(helmet());

// Configure CORS
const allowedOrigins = [
  /^http:\/\/localhost:\d{4}$/, // Loalhost on any 4-digit port
  /^https:\/\/carepop\.vercel\.app$/, // Production deployment
  /^https:\/\/.*--carepop\.vercel\.app$/, // Vercel Preview Deployments
];

const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if the origin matches any of our allowed origins
        const isAllowed = allowedOrigins.some(regex => regex.test(origin));
        if (isAllowed) {
            return callback(null, true);
        }

        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Add handlers for root and robots.txt
app.get('/', (req, res) => {
  res.status(200).json({ message: 'CarePoP Backend API is running.' });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

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
    app.use('/api/v1/public', publicRoutes); // Mount all public routes
    app.use('/api/v1/admin', adminRoutes); // Mount all protected admin routes
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