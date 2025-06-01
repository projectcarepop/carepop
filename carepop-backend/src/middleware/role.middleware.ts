import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware'; // Import the extended request type
import { StatusCodes } from 'http-status-codes';

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userRole = req.user?.role;

  if (userRole) {
    if (typeof userRole === 'string' && userRole === 'admin') {
      next(); // User has the 'admin' role (string type)
      return;
    } else if (Array.isArray(userRole) && userRole.includes('admin')) {
      next(); // User has the 'admin' role (array type)
      return;
    }
  }

  // If role is not present, or is not 'admin', or is not an array containing 'admin'
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