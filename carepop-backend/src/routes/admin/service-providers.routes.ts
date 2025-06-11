import { Router } from 'express';
import * as providerServiceController from '@/controllers/admin/provider-service.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import { serviceProvidersParams } from '@/validation/admin/provider-service.validation';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(
    validateRequest({ params: serviceProvidersParams }),
    providerServiceController.getProvidersForService
  );

export default router; 