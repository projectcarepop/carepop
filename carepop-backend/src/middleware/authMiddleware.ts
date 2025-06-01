import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient'; // Adjust path if necessary

// Extend Express Request type to include 'user'
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string; // Optional: if you want to pass email
    role?: string | string[]; // Add role to the interface
    // Add other user properties from JWT if needed, e.g., role
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: 'Access token is required.' });
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.warn('[AuthMiddleware] Error validating token with Supabase:', error.message);
      // Distinguish between different types of errors if needed
      // e.g., 'invalid_token', 'expired_token'
      // For now, a general 403 for any token validation issue.
      res.status(403).json({ message: 'Invalid or expired token.', details: error.message });
      return;
    }

    if (!user) {
      // This case should ideally not be reached if Supabase returns an error for no user,
      // but as a safeguard:
      console.warn('[AuthMiddleware] Token valid, but no user object returned from Supabase.');
      res.status(403).json({ message: 'Authentication failed: No user found for token.' });
      return;
    }

    // Attach user information to the request object
    req.user = { 
      id: user.id,
      email: user.email, // Include email if available and needed by downstream handlers
      // Attempt to extract role from app_metadata. Handle both string and array cases.
      role: user.app_metadata?.role || (Array.isArray(user.app_metadata?.roles) ? user.app_metadata.roles : undefined)
    }; 
    
    next(); // Proceed to the next middleware or route handler

  } catch (err: any) {
    console.error('[AuthMiddleware] Unexpected error during token validation:', err);
    res.status(500).json({ message: 'Internal server error during authentication.', details: err.message });
    return;
  }
}; 