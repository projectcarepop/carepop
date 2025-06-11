import { Router } from 'express';
import { registerUser, loginUser } from '@/controllers/public/auth.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import { registerUserSchema, loginUserSchema } from '@/validation/auth.validation';

const router = Router();

router.post('/register', validateRequest({ body: registerUserSchema }), registerUser);
router.post('/login', validateRequest({ body: loginUserSchema }), loginUser);

export default router; 