import { Router } from 'express';
import {
  createProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
} from '@/controllers/admin/provider.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  createProviderSchema,
  updateProviderSchema,
  providerIdParamSchema,
  listProvidersQuerySchema,
} from '@/validation/admin/provider.validation';

// Nested routes for services associated with a provider
import providerServicesRoutes from './provider-services.routes';

const router = Router();

router.route('/')
  .post(validateRequest({ body: createProviderSchema }), createProvider)
  .get(validateRequest({ query: listProvidersQuerySchema }), getProviders);

router.route('/:id')
  .get(validateRequest({ params: providerIdParamSchema }), getProviderById)
  .put(validateRequest({ params: providerIdParamSchema, body: updateProviderSchema }), updateProvider)
  .delete(validateRequest({ params: providerIdParamSchema }), deleteProvider);

// Nested routes for services associated with a provider
router.use('/:id/services', providerServicesRoutes);

export default router; 