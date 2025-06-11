import { Request, Response } from 'express';
import { authService } from '../../services/public/auth.service';

export const authController = {
    signUp: async (req: Request, res: Response) => {
        try {
            const result = await authService.signUp(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            console.error('Sign-up Error:', error);
            res.status(400).json({ message: error.message || 'An unexpected error occurred during sign-up.' });
        }
    },
    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const { session, user } = await authService.login(email, password);
            res.status(200).json({ session, user });
        } catch (error: any) {
            console.error('Login Error:', error);
            res.status(401).json({ message: error.message || 'Invalid credentials.' });
        }
    },
    loginWithGoogle: async (req: Request, res: Response) => {
        try {
            const { code } = req.body;
            const { session, user } = await authService.loginWithGoogle(code);
            res.status(200).json({ session, user });
        } catch (error: any) {
            console.error('Google Login Error:', error);
            res.status(401).json({ message: error.message || 'Google authentication failed.' });
        }
    },
    forgotPassword: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.status(200).json(result);
        } catch (error: any) {
            console.error('Forgot Password Error:', error);
            res.status(400).json({ message: error.message || 'Failed to send password reset email.' });
        }
    },
    resetPassword: async (req: Request, res: Response) => {
        try {
            const result = await authService.resetPassword(req.body);
            res.status(200).json(result);
        } catch (error: any) {
            console.error('Reset Password Error:', error);
            res.status(400).json({ message: error.message || 'Failed to reset password.' });
        }
    },
}; 