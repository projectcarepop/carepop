import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabaseInitializationPromise, supabase, supabaseServiceRole } from './config/supabaseClient';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import directoryRoutes from './routes/directoryRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import providerRoutes from './routes/providerRoutes';
import adminClinicRoutes from './routes/admin/clinic.admin.routes';
import adminProviderRoutes from './routes/admin/provider.admin.routes';
import adminDashboardRoutes from './routes/admin/dashboard.admin.routes';
import { getConfig } from './config/config';
import { ZodError } from 'zod';

const app: Express = express();
const config = getConfig();

// --- Health Check (Keep at top) ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy' });
});

// --- Middleware ---
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

// --- Setup Swagger (Assuming this function exists elsewhere and is correctly set up if used)
// if (typeof setupSwagger === 'function') setupSwagger(app);

// --- Mount Routers ---
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/v1/directory', directoryRoutes);
app.use('/api/v1', serviceRoutes);
app.use('/api/v1', providerRoutes);
app.use('/api/v1/admin', adminDashboardRoutes);
app.use('/api/v1/admin/clinics', adminClinicRoutes);
app.use('/api/v1/admin/providers', adminProviderRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/availability', availabilityRoutes);

// --- Centralized Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    logger.error('Zod Validation Error:', {
      message: err.message,
      errors: err.errors,
      originalError: err,
      stack: err.stack
    });
    if (res.headersSent) {
      return next(err);
    }
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten().fieldErrors
    });
  } else {
    logger.error(`Unhandled Error: ${err.message}`, {
      error: err,
      stack: err.stack,
    });
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// --- 404 Handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

// --- Start Server Async ---
async function startServer() {
  try {
    await supabaseInitializationPromise; // Wait for Supabase to be ready
    logger.info('Supabase clients initialized successfully by server.');

    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      // if (config.nodeEnv === 'development' && typeof setupSwagger === 'function') {
      //   logger.info(`Swagger UI available at http://localhost:${PORT}/api-docs`);
      // }
    });
  } catch (error) {
    logger.error('Failed to start server due to an initialization error (e.g., Supabase):', error);
    process.exit(1); // Exit if server can't start
  }
}

startServer(); // Call the async function to start the server

export default app; 