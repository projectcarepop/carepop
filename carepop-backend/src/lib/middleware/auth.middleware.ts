import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@/lib/utils/appError';
import { asyncHandler } from '@/utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';

// Define the shape of the request object after authentication
export interface AuthenticatedRequest extends Request {
    user?: {
        sub: string; // The user ID from the Supabase JWT
        role: string; // The user role from the Supabase JWT
        [key: string]: any;
    };
}

// This middleware protects routes by verifying a Supabase JWT.
// It is designed to be robust and prevent server crashes from invalid tokens.
export const authMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // Using optional chaining for safety

    if (!token) {
        // If there's no token, we throw a specific, handled error.
        // This will result in a 401 response, not a 500 server crash.
        throw new AppError('Unauthorized: Access token is missing or malformed', StatusCodes.UNAUTHORIZED);
    }

    try {
        // We verify the token using the secret from our environment variables.
        // If the secret is missing, process.env.SUPABASE_JWT_SECRET will be undefined, and this WILL fail.
        const decodedPayload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);

        // IMPORTANT: The decoded payload from a Supabase JWT contains user info like 'sub' (user ID) and 'role'.
        // We attach this payload to the request object for later use in our controllers.
        req.user = decodedPayload as AuthenticatedRequest['user'];
        
        next(); // If verification is successful, proceed to the next middleware or controller.
    } catch (error) {
        // If jwt.verify fails (e.g., token expired, signature invalid), it throws an error.
        // We catch it here and return a standardized 401 error.
        // This prevents the entire server from crashing.
        throw new AppError('Unauthorized: Invalid or expired token', StatusCodes.UNAUTHORIZED);
    }
}); 