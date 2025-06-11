import { Request, Response, NextFunction } from 'express';

export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: 'Forbidden: User data or roles not available on request object.' });
        }

        const userRoles = req.user.roles as string[];
        const hasPermission = userRoles.some(role => allowedRoles.includes(role));
        
        if (!hasPermission) {
            return res.status(403).json({ message: `Forbidden: Access requires one of the following roles: ${allowedRoles.join(', ')}` });
        }

        next();
    };
}; 