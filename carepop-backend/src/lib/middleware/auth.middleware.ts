import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase/public-client';
import { serviceSupabase } from '../supabase/service-client'; // Corrected import path
import { AppError } from '../utils/appError';

// Extend the Express Request type to include our user object.
// This provides type safety for req.user in subsequent middleware and controllers.
declare global {
    namespace Express {
        interface Request {
            user?: any; // For a more robust type, define an interface for the full user object
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

        if (tokenError || !user) {
            console.error('Auth token validation error:', tokenError);
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.', details: tokenError?.message });
        }

        const { data: profile, error: profileError } = await serviceSupabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile) {
            console.error(`Profile fetch error for user ${user.id}:`, profileError);
            return res.status(404).json({ message: `User profile not found for user ID: ${user.id}`, details: profileError?.message });
        }

        const { data: roles, error: rolesError } = await serviceSupabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

        if (rolesError) {
            console.error(`Roles fetch error for user ${user.id}:`, rolesError);
            return res.status(500).json({ message: 'Failed to fetch user roles.', details: rolesError?.message });
        }

        req.user = {
            ...profile,
            roles: roles ? roles.map((r: { role: string }) => r.role) : [],
        };
        
        next();
    } catch (error: any) {
        console.error('Unhandled error in auth middleware:', error);
        return res.status(500).json({ message: 'Internal Server Error in authentication middleware.' });
    }
}; 