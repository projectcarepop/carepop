import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabaseInitializationPromise } from './config/supabaseClient';

// Non-admin routes
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import directoryRoutes from './routes/directoryRoutes';
// The old service, provider, appt, avail routes might be refactored or kept
// depending on whether they are for non-admin users. Assuming they are for now.
import serviceRoutes from './routes/serviceRoutes'; 
import appointmentRoutes from './routes/appointmentRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import providerRoutes from './routes/providerRoutes';

// NEW: Consolidated Admin Routes
import adminRoutes from './routes/admin';

// NEW: Global Error Handler
import { errorHandler } from './middleware/errorHandler';

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

    // --- Mount Non-Admin Routers ---
    app.use('/api/auth', authRoutes);
    app.use('/api/users', profileRoutes); // Consider renaming to /api/profiles
    app.use('/api/v1/directory', directoryRoutes);
    app.use('/api/v1', serviceRoutes);
    app.use('/api/v1', providerRoutes);
    app.use('/api/v1/appointments', appointmentRoutes);
    app.use('/api/v1/availability', availabilityRoutes);
    logger.info('Non-admin routes mounted.');
    
    // --- Mount ALL Admin Routes ---
    app.use('/api/v1/admin', adminRoutes);
    logger.info('All admin routes mounted under /api/v1/admin.');
    
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