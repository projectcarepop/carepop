import { Router } from 'express';
import { authController } from '../../controllers/public/auth.controller';
import { validate } from '../../lib/middleware/validate';
import { 
    signUpSchema, 
    loginSchema, 
    loginWithGoogleSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} from '../../validation/public/auth.validation';

const router = Router();

router.post('/signup', validate(signUpSchema), authController.signUp);
router.post('/login', validate(loginSchema), authController.login);
router.post('/login-google', validate(loginWithGoogleSchema), authController.loginWithGoogle);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router; 