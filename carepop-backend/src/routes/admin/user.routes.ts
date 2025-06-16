import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserRoles,
  getMyProfile
} from '@/controllers/admin/user.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  userIdParamSchema,
  listUsersQuerySchema,
  updateUserRolesSchema,
} from '@/validation/admin/user.validation';

const router = Router();

router.get('/me', getMyProfile);

router.route('/')
  .get(validateRequest({ query: listUsersQuerySchema }), getUsers);

router.route('/:id')
  .get(validateRequest({ params: userIdParamSchema }), getUserById);
  
router.route('/:id/roles')
    .put(validateRequest({ params: userIdParamSchema, body: updateUserRolesSchema }), updateUserRoles);

export default router; 