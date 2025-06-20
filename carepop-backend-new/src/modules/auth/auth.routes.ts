import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerUserSchema, loginUserSchema } from './auth.validation';
import { authService } from './auth.service';

const authRoutes = new Hono();

// We will add routes for register, login, etc. here.
authRoutes.post('/register', zValidator('json', registerUserSchema), async (c) => {
  const userInput = c.req.valid('json');
  const authData = await authService.registerUser(userInput);
  return c.json({
    message: 'Registration successful. Please check your email to confirm your account.',
    user: authData.user,
  }, 201);
});

authRoutes.post('/login', zValidator('json', loginUserSchema), async (c) => {
  const loginInput = c.req.valid('json');
  const sessionData = await authService.loginUser(loginInput);
  return c.json(sessionData, 200);
});

export default authRoutes; 