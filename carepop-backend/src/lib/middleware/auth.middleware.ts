import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

// This middleware protects routes by verifying a Supabase JWT.
// It is designed to be robust and prevent server crashes from invalid tokens.
export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // Using optional chaining for safety

    if (!token) {
        // If there's no token, we throw a specific, handled error.
        // This will result in a 401 response, not a 500 server crash.
        throw new ApiError(401, 'Unauthorized: Access token is missing or malformed');
    }

    try {
        // We verify the token using the secret from our environment variables.
        // If the secret is missing, process.env.SUPABASE_JWT_SECRET will be undefined, and this WILL fail.
        const decodedPayload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);

        // IMPORTANT: The decoded payload from a Supabase JWT contains user info like 'sub' (user ID) and 'role'.
        // We attach this payload to the request object for later use in our controllers.
        // @ts-ignore - We are intentionally extending the Express Request object.
        req.user = decodedPayload;
        
        next(); // If verification is successful, proceed to the next middleware or controller.
    } catch (error) {
        // If jwt.verify fails (e.g., token expired, signature invalid), it throws an error.
        // We catch it here and return a standardized 401 error.
        // This prevents the entire server from crashing.
        throw new ApiError(401, 'Unauthorized: Invalid or expired token');
    }
}); 