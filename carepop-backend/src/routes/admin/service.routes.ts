import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from '@/controllers/admin/service.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdParamSchema,
  listServicesQuerySchema,
} from '@/validation/admin/service.validation';

// Nested routes for providers associated with a service
import serviceProvidersRoutes from './service-providers.routes';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createServiceSchema }), createService)
  .get(validateRequest({ query: listServicesQuerySchema }), getServices);

router.route('/:id')
  .get(validateRequest({ params: serviceIdParamSchema }), getServiceById)
  .put(validateRequest({ params: serviceIdParamSchema, body: updateServiceSchema }), updateService)
  .delete(validateRequest({ params: serviceIdParamSchema }), deleteService);

// Nested routes for providers associated with a service
router.use('/:id/providers', serviceProvidersRoutes);

export default router; 