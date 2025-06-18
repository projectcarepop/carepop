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
  searchSchema
} from '@/validation/admin/user.validation';
import { getMedicalRecordsByUserId } from '@/controllers/admin/medical-record.controller';

const router = Router();

// List all users
router.route('/')
  .get(validateRequest({ query: listUsersQuerySchema }), getUsers);

// Get the current authenticated user's profile
// This MUST be before the /:id route to avoid 'me' being treated as an ID
router.get('/me', getMyProfile);

// Get a specific user by ID
router.route('/:id')
  .get(validateRequest({ params: userIdParamSchema }), getUserById);
  
// Get medical records for a specific user
router.route('/:id/medical-records')
    .get(
        validateRequest({ params: userIdParamSchema, query: searchSchema }),
        getMedicalRecordsByUserId
    );

// Update a specific user's roles
router.route('/:id/roles')
    .put(validateRequest({ params: userIdParamSchema, body: updateUserRolesSchema }), updateUserRoles);

export default router; 