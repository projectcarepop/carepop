import { Router } from 'express';
import { UserAdminController } from '../../controllers/admin/user.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validateRequest';
import { listUsersQuerySchema, getUserParamsSchema } from '../../validation/admin/user.admin.validation';


export class AdminUserRoutes {
  router: Router;

  constructor(private controller: UserAdminController) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      '/',
      authenticateToken,
      isAdmin,
      validateRequest({ query: listUsersQuerySchema }),
      this.controller.listUsers.bind(this.controller)
    );

    this.router.get(
      '/:userId',
      authenticateToken,
      isAdmin,
      validateRequest({ params: getUserParamsSchema }),
      this.controller.getUserDetails.bind(this.controller)
    );
    
    this.router.put(
      '/:userId',
      authenticateToken,
      isAdmin,
      // TODO: Add validation for update user
      this.controller.updateUser.bind(this.controller)
    );
  }
} 