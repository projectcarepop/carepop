import { Router } from 'express';
import * as authController from '@/controllers/public/authController';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import { loginSchema, signUpSchema } from '@/validation/public/authValidation';

const router = Router();

router.post('/signup', validateRequest(signUpSchema), authController.signUp);
router.post('/login', validateRequest(loginSchema), authController.login);

export default router; 