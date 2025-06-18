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
    // --- START DIAGNOSTIC LOGGING ---
    console.log(`[AUTH MIDDLEWARE] Received ${req.method} request for ${req.path}`);
    console.log('[AUTH MIDDLEWARE] Headers:', JSON.stringify(req.headers, null, 2));
    // --- END DIAGNOSTIC LOGGING ---
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[AUTH MIDDLEWARE] Failed: No token or malformed header.');
        return res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error: tokenError } = await serviceSupabase.auth.getUser(token);

        if (tokenError || !user) {
            console.error('Auth token validation error:', tokenError);
            console.log('[AUTH MIDDLEWARE] Failed: Invalid or expired token.');
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.', details: tokenError?.message });
        }

        const { data: profile, error: profileError } = await serviceSupabase
            .from('users_view')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error(`Profile fetch error from users_view for user ${user.id}:`, profileError);
            return res.status(404).json({ message: `User profile not found in users_view for user ID: ${user.id}`, details: profileError?.message });
        }

        req.user = profile;
        
        console.log(`[AUTH MIDDLEWARE] Success: Authenticated user ${req.user.id}`);
        next();
    } catch (error: any) {
        console.error('Unhandled error in auth middleware:', error);
        return res.status(500).json({ message: 'Internal Server Error in authentication middleware.' });
    }
}; 