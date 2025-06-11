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

// --- Start Server Async ---
async function startServer() {
  try {
    await supabaseInitializationPromise; // Wait for Supabase to be ready
    logger.info('Supabase clients initialized successfully by server.');

    // --- DI and Route Mounting ---
    if (!supabaseServiceRole) {
      throw new Error("Supabase service role client not available after initialization.");
    }

    // --- Mount Non-Admin Routers ---
    app.use('/api/auth', authRoutes);
    app.use('/api/users', profileRoutes);
    app.use('/api/v1/directory', directoryRoutes);
    app.use('/api/v1', serviceRoutes);
    app.use('/api/v1', providerRoutes);
    app.use('/api/v1/appointments', appointmentRoutes);
    app.use('/api/v1/availability', availabilityRoutes);
    logger.info('Non-admin routes mounted.');
    
    // --- Mount Admin Routes (Order is important: specific routes before general ones) ---
    
    // Clinics (More specific)
    const { AdminClinicController } = await import('./controllers/admin/clinic.admin.controller');
    const { AdminClinicService } = await import('./services/admin/clinic.admin.service');
    const { createAdminClinicRoutes } = await import('./routes/admin/clinic.admin.routes');
    const adminClinicService = new AdminClinicService(supabaseServiceRole);
    const adminClinicController = new AdminClinicController(adminClinicService);
    const adminClinicRoutes = createAdminClinicRoutes(adminClinicController);
    app.use('/api/v1/admin/clinics', adminClinicRoutes);
    logger.info('Admin Clinic routes mounted.');

    // Providers (More specific)
    const { AdminProviderController } = await import('./controllers/admin/provider.admin.controller');
    const { AdminProviderService } = await import('./services/admin/provider.admin.service');
    const { createAdminProviderRoutes } = await import('./routes/admin/provider.admin.routes');
    const adminProviderService = new AdminProviderService(supabaseServiceRole);
    const adminProviderController = new AdminProviderController(adminProviderService);
    const adminProviderRoutes = createAdminProviderRoutes(adminProviderController);
    app.use('/api/v1/admin/providers', adminProviderRoutes);
    logger.info('Admin Provider routes mounted.');

    // Suppliers (Admin)
    const supplierAdminRoutes = (await import('./routes/admin/supplier.admin.routes')).default;
    app.use('/api/v1/admin/suppliers', supplierAdminRoutes);
    logger.info('Admin Supplier routes mounted.');

    // Inventory Items (Admin)
    const inventoryItemAdminRoutes = (await import('./routes/admin/inventory-item.admin.routes')).default;
    app.use('/api/v1/admin/inventory-items', inventoryItemAdminRoutes);
    logger.info('Admin Inventory Item routes mounted.');

    // Users (Admin)
    const { UserAdminController } = await import('./controllers/admin/user.admin.controller');
    const { UserAdminService } = await import('./services/admin/user.admin.service');
    const { createAdminUserRoutes } = await import('./routes/admin/user.admin.routes');
    const userAdminService = new UserAdminService(supabaseServiceRole);
    const userAdminController = new UserAdminController(userAdminService);
    const adminUserRoutes = createAdminUserRoutes(userAdminController);
    app.use('/api/v1/admin/users', adminUserRoutes);
    logger.info('Admin User routes mounted.');
    
    // Profiles (Admin)
    const profileAdminRoutes = (await import('./routes/admin/profile.admin.routes')).default;
    app.use('/api/v1/admin/profiles', profileAdminRoutes);
    logger.info('Admin Profile routes mounted.');

    // Services (Admin)
    const serviceAdminRoutes = (await import('./routes/admin/service.admin.routes')).default;
    app.use('/api/v1/admin/services', serviceAdminRoutes);
    logger.info('Admin Service routes mounted.');

    // Provider-Service Assignments (Admin) - Nested Routes
    const { ProviderServiceAdminController } = await import('./controllers/admin/provider-service.admin.controller');
    const { ProviderServiceAdminService } = await import('./services/admin/provider-service.admin.service');
    const { createProviderServicesRoutes, createServiceProvidersRoutes } = await import('./routes/admin/provider-service.admin.routes');
    
    const providerServiceAdminService = new ProviderServiceAdminService();
    const providerServiceAdminController = new ProviderServiceAdminController(providerServiceAdminService);
    
    const providerServicesRoutes = createProviderServicesRoutes(providerServiceAdminController);
    app.use('/api/v1/admin/providers/:providerId/services', providerServicesRoutes);

    const serviceProvidersRoutes = createServiceProvidersRoutes(providerServiceAdminController);
    app.use('/api/v1/admin/services/:serviceId/providers', serviceProvidersRoutes);
    logger.info('Admin Provider-Service assignment routes mounted.');

    // Service Categories (Admin)
    const serviceCategoryAdminRoutes = (await import('./routes/admin/service-category.admin.routes')).default;
    app.use('/api/v1/admin/service-categories', serviceCategoryAdminRoutes);
    logger.info('Admin Service Category routes mounted.');

    // Appointments (Admin)
    const appointmentAdminRoutes = (await import('./routes/admin/appointment.admin.routes')).default;
    app.use('/api/v1/admin/appointments', appointmentAdminRoutes);
    logger.info('Admin Appointment routes mounted.');

    // Reports (Admin)
    const { ReportAdminController } = await import('./controllers/admin/report.admin.controller');
    const { ReportAdminService } = await import('./services/admin/report.admin.service');
    const { createAdminReportRoutes, createAdminSingleReportRoutes } = await import('./routes/admin/report.admin.routes');
    const reportAdminService = new ReportAdminService(supabaseServiceRole);
    const reportAdminController = new ReportAdminController(reportAdminService);
    
    const adminReportRoutes = createAdminReportRoutes(reportAdminController);
    app.use('/api/v1/admin/appointments/:appointmentId/reports', adminReportRoutes);

    const adminSingleReportRoutes = createAdminSingleReportRoutes(reportAdminController);
    app.use('/api/v1/admin/reports', adminSingleReportRoutes);
    logger.info('Admin Report routes mounted.');

    // Medical Records (Admin)
    const { MedicalRecordAdminController } = await import('./controllers/admin/medicalRecord.admin.controller');
    const { MedicalRecordAdminService } = await import('./services/admin/medicalRecord.admin.service');
    const { createAdminMedicalRecordRoutes, createAdminSingleMedicalRecordRoutes } = await import('./routes/admin/medicalRecord.admin.routes');
    const medicalRecordAdminService = new MedicalRecordAdminService(supabaseServiceRole);
    const medicalRecordAdminController = new MedicalRecordAdminController(medicalRecordAdminService);

    const adminMedicalRecordRoutes = createAdminMedicalRecordRoutes(medicalRecordAdminController);
    app.use('/api/v1/admin/users/:userId/records', adminMedicalRecordRoutes);
    
    const adminSingleMedicalRecordRoutes = createAdminSingleMedicalRecordRoutes(medicalRecordAdminController);
    app.use('/api/v1/admin/records', adminSingleMedicalRecordRoutes);
    logger.info('Admin Medical Record routes mounted.');

    // Dashboard (Most general admin route, mounted last)
    const { AdminDashboardController } = await import('./controllers/admin/dashboard.admin.controller');
    const { AdminDashboardService } = await import('./services/admin/dashboard.admin.service');
    const { createAdminDashboardRoutes } = await import('./routes/admin/dashboard.admin.routes');
    const adminDashboardService = new AdminDashboardService(supabaseServiceRole);
    const adminDashboardController = new AdminDashboardController(adminDashboardService);
    const adminDashboardRoutes = createAdminDashboardRoutes(adminDashboardController);
    app.use('/api/v1/admin', adminDashboardRoutes);
    logger.info('Admin Dashboard routes mounted.');

    // --- Centralized Error Handling (MUST be after all routes) ---
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

    // --- 404 Handler (MUST be the last route handler) ---
    app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Resource not found' });
    });

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