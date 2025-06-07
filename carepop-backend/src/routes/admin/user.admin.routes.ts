import { Router } from 'express';
import { UserAdminController } from '../../controllers/admin/user.admin.controller';
import { UserAdminService } from '../../services/admin/user.admin.service';
import { supabase } from '../../config/supabaseClient';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';

export const createAdminUserRoutes = (controller: UserAdminController): Router => {
  const router = Router();

  router.get(
    '/',
    authenticateToken,
    isAdmin,
    controller.listUsers.bind(controller)
  );

  router.get(
    '/:userId',
    authenticateToken,
    isAdmin,
    controller.getUserDetails.bind(controller)
  );

  return router;
}; 