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
        // Still use the public client to validate the token initially.
        const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);
        if (tokenError || !user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
        }

        // Step 1: Fetch profile using the SERVICE client to bypass RLS.
        const { data: profile, error: profileError } = await serviceSupabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            return res.status(404).json({ message: 'User profile not found.' });
        }

        // Step 2: Fetch roles using the SERVICE client to bypass RLS.
        const { data: roles, error: rolesError } = await serviceSupabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

        if (rolesError) {
            console.error('Roles fetch error:', rolesError);
            return res.status(500).json({ message: 'Failed to fetch user roles.' });
        }

        // Step 3: Combine profile and roles into a single user object for the request.
        req.user = {
            ...profile,
            roles: roles ? roles.map((r: { role: string }) => r.role) : [],
        };
        
        next();
    } catch (error: any) {
        return res.status(401).json({ message: 'Unauthorized: An error occurred while processing the token.' });
    }
}; 