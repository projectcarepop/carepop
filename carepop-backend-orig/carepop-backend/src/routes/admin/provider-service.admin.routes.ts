import { Router } from 'express';
import { ProviderServiceAdminController } from '../../controllers/admin/provider-service.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

// This router will be nested under /providers/:providerId/services
export function createProviderServicesRoutes(controller: ProviderServiceAdminController): Router {
  const router = Router({ mergeParams: true }); // mergeParams is essential for nested routers

  router.get(
    '/',
    authenticateToken,
    isAdmin,
    controller.getServicesForProvider.bind(controller)
  );

  router.post(
    '/',
    authenticateToken,
    isAdmin,
    controller.assignServiceToProvider.bind(controller)
  );

  router.delete(
    '/:serviceId',
    authenticateToken,
    isAdmin,
    controller.unassignServiceFromProvider.bind(controller)
  );

  return router;
}

// This router will be nested under /services/:serviceId/providers
export function createServiceProvidersRoutes(controller: ProviderServiceAdminController): Router {
  const router = Router({ mergeParams: true }); // mergeParams is essential for nested routers

  router.get(
    '/',
    authenticateToken,
    isAdmin,
    controller.getProvidersForService.bind(controller)
  );

  return router;
} 