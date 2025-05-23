import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { supabase, supabaseServiceRole } from './config/supabaseClient';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import directoryRoutes from './routes/directoryRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import { getConfig } from './config/config';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app: Express = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', // For carepop-web local development
  'http://localhost:3001', // For carepop-web local development (when port 3000 is in use)
  // Add other origins as needed, e.g., your deployed frontend URL
  // For mobile development, the origin can sometimes be tricky.
  // Allowing the specific IP of your development machine (if emulator connects via it)
  // or using a more open policy for local dev might be necessary temporarily.
  // Consider making this more dynamic or configurable for different environments.
  `http://${process.env.DEV_MACHINE_IP || '192.168.254.116'}` // Allows emulator if it uses machine IP as origin (port agnostic)
];

if (process.env.EXPO_GO_URL) { // exp://192.168.254.116:8081 -> http://192.168.254.116
  try {
    const expoUrl = new URL(process.env.EXPO_GO_URL);
    const httpEquivalentOrigin = `http://${expoUrl.hostname}`;
    if (!allowedOrigins.includes(httpEquivalentOrigin)) {
      allowedOrigins.push(httpEquivalentOrigin);
    }
  } catch (e) {
    logger.warn('[CORS Setup] Could not parse EXPO_GO_URL to add to allowed origins', e);
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || 
        (origin && /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) || // Allow any 192.168.x.x IP for broader local dev
        (origin && /^http:\/\/10\.0\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) // Allow any 10.0.x.x IP (common for emulators)
    ) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you need to handle cookies or authorization headers
  optionsSuccessStatus: 200
}));
app.use(express.json()); // Middleware to parse JSON bodies

// --- Mount Routers ---
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth
app.use('/api/users', profileRoutes); // Mount profile routes under /api/users
app.use('/api/v1/directory', directoryRoutes); // Mount directory routes under /api/v1/directory
app.use('/api/v1', serviceRoutes); // Add the service routes under /api/v1
app.use('/api/v1/appointments', appointmentRoutes); // Added: Mount appointment routes

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