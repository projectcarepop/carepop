import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware'; // Import the extended request type
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  logger.info('[isAdmin Middleware] Checking admin access.');
  
  if (!req.user) {
    logger.error('[isAdmin Middleware] CRITICAL: req.user object is missing. This should have been set by authMiddleware.');
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication error: User object not found on request.' });
    return;
  }

  const { id, role } = req.user;
  logger.info(`[isAdmin Middleware] User ID: ${id}, Role: ${role}`);

  if (role) {
    if (typeof role === 'string' && role === 'admin') {
      logger.info(`[isAdmin Middleware] Access granted for user ${id} with role 'admin'.`);
      next();
      return;
    } else if (Array.isArray(role) && role.includes('admin')) {
      logger.info(`[isAdmin Middleware] Access granted for user ${id} with role array including 'admin'.`);
      next();
      return;
    }
  }

  logger.warn(`[isAdmin Middleware] Access DENIED for user ${id}. Role was '${role}'.`);
  res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied. Admin privileges required.' });
};

// Placeholder for other role-based middleware if needed, e.g.:
// export const isProvider = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//   const userRole = req.user?.role;
//   if (userRole && ((typeof userRole === 'string' && userRole === 'provider') || (Array.isArray(userRole) && userRole.includes('provider')))) {
//     next();
//   } else {
//     res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied. Provider privileges required.' });
//   }
// }; 