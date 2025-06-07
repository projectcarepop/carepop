import { Router } from 'express';
import { UserAdminController } from '../../controllers/admin/user.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validateRequest';
import { listUsersQuerySchema, getUserParamsSchema, updateUserBodySchema } from '../../validation/admin/user.admin.validation';

export const createAdminUserRoutes = (controller: UserAdminController): Router => {
  const router = Router();

  router.get(
    '/',
    authenticateToken,
    isAdmin,
    validateRequest({ query: listUsersQuerySchema }),
    controller.listUsers.bind(controller)
  );

  router.get(
    '/:userId',
    authenticateToken,
    isAdmin,
    validateRequest({ params: getUserParamsSchema }),
    controller.getUserDetails.bind(controller)
  );

  router.put(
    '/:userId',
    authenticateToken,
    isAdmin,
    validateRequest({ params: getUserParamsSchema, body: updateUserBodySchema }),
    controller.updateUser.bind(controller)
  );

  return router;
};