import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase/client';

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
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
        }

        // Token is valid. Now, fetch the user's profile and roles using our DB function.
        // This is more efficient than making multiple separate queries.
        const { data: fullUser, error: dbError } = await supabase
            .rpc('get_user_data', { user_id_param: user.id })
            .single();
        
        if (dbError || !fullUser) {
             return res.status(404).json({ message: 'User profile not found.' });
        }

        req.user = fullUser;
        next();
    } catch (error: any) {
        return res.status(401).json({ message: 'Unauthorized: An error occurred while processing the token.' });
    }
}; 