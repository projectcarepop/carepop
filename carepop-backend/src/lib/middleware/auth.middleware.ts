import { Request, Response, NextFunction } from 'express';
import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided, authorization denied.', StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('No token provided, authorization denied.', StatusCodes.UNAUTHORIZED));
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return next(new AppError('Invalid token, authorization denied.', StatusCodes.UNAUTHORIZED));
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
        return next(new AppError('Could not verify user roles.', StatusCodes.INTERNAL_SERVER_ERROR));
    }

    req.user = {
      id: user.id,
      email: user.email!,
      roles: roleData?.map(r => r.role) || [],
    };
    
    next();
  } catch (error) {
    next(new AppError('Not authorized, token failed.', StatusCodes.UNAUTHORIZED));
  }
}; 