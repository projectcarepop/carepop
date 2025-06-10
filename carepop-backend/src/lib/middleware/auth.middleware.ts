import { Request, Response, NextFunction } from 'express';
import { supabase } from '@/lib/supabase/client';
import { ApiError } from '@/utils/ApiError';
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
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No token provided, authorization denied.'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'No token provided, authorization denied.'));
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token, authorization denied.'));
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
        return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Could not verify user roles.'));
    }

    req.user = {
      id: user.id,
      email: user.email!,
      roles: roleData?.map(r => r.role) || [],
    };
    
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authorized, token failed.'));
  }
}; 