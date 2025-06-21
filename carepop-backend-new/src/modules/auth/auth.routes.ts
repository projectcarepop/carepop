import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerUserSchema, loginUserSchema } from './auth.validation';
import { authService } from './auth.service';

const app = new Hono()
    .post(
        '/register',
        zValidator('json', registerUserSchema),
        async (c) => {
            const body = c.req.valid('json');
            const data = await authService.registerUser(body);
            return c.json(data, 201);
        }
    )
    .post(
        '/login',
        zValidator('json', loginUserSchema),
        async (c) => {
            const body = c.req.valid('json');
            const data = await authService.loginUser(body);
            return c.json(data);
        }
    )
    .post('/logout', async (c) => {
        const { error } = await authService.logoutUser();
        if (error) {
            console.error('Supabase signout error:', error);
        }
        return c.json({ message: 'Logged out successfully' }, 200);
    });

export default app; 