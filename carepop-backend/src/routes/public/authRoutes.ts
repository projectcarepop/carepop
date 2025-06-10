import { Router } from 'express';
import * as authController from '@/controllers/public/authController';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import { loginSchema, signUpSchema } from '@/validation/public/authValidation';

const router = Router();

router.post('/signup', validateRequest({ body: signUpSchema.shape.body }), authController.signUp);
router.post('/login', validateRequest({ body: loginSchema.shape.body }), authController.login);

export default router; 