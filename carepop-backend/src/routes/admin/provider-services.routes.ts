import { Router } from 'express';
import * as providerServiceController from '@/controllers/admin/provider-service.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  providerServiceParams,
  assignServiceBody,
  unassignServiceParams,
} from '@/validation/admin/provider-service.validation';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(
    validateRequest({ params: providerServiceParams }),
    providerServiceController.getServicesForProvider
  )
  .post(
    validateRequest({ params: providerServiceParams, body: assignServiceBody }),
    providerServiceController.assignServiceToProvider
  );

router
  .route('/:serviceId')
  .delete(
    validateRequest({ params: unassignServiceParams }),
    providerServiceController.unassignServiceFromProvider
  );

export default router; 