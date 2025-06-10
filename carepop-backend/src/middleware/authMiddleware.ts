import { Response, NextFunction } from 'express';
import { supabaseServiceRole } from '@/config/supabaseClient';
import { AuthenticatedRequest } from '@/types/authenticated-request.interface';
import { AppError } from '@/utils/errors';

// Extend the Express Request interface to include our user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      };
    }
  }
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required.', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabaseServiceRole.auth.getUser(token);

    if (userError || !user) {
      throw new AppError('Invalid or expired token.', 401);
    }

    // Token is valid, now fetch user roles from the user_roles table
    const { data: rolesData, error: rolesError } = await supabaseServiceRole
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw new AppError('Could not verify user permissions.', 500);
    }
    
    const roles = rolesData ? rolesData.map((r: { role: string }) => r.role) : [];

    // Attach user and roles to the request object
    req.user = { id: user.id, roles };

    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.roles.includes('admin')) {
    return res.status(403).json({ message: 'Forbidden: Administrator access required.' });
  }
  next();
}; 