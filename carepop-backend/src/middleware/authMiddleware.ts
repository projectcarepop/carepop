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
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.warn('[AuthMiddleware] Error validating token with Supabase:', authError.message);
      res.status(403).json({ message: 'Invalid or expired token.', details: authError.message });
      return;
    }

    if (!authUser) {
      console.warn('[AuthMiddleware] Token valid, but no user object returned from Supabase.');
      res.status(403).json({ message: 'Authentication failed: No user found for token.' });
      return;
    }

    // Fetch user role from public.user_roles table
    let userRole: string | undefined = undefined;
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      if (roleError && roleError.code !== 'PGRST116') { // PGRST116 means no row was found
        console.error('[AuthMiddleware] Error fetching user role:', roleError.message);
        // Decide if this is a critical error. For now, proceed without role if not found or error.
      }
      if (roleData) {
        userRole = roleData.role;
      }
    } catch (dbError: any) {
      console.error('[AuthMiddleware] Database error fetching role:', dbError.message);
      // Proceed without role in case of unexpected db error
    }

    // Attach user information to the request object
    req.user = { 
      id: authUser.id,
      email: authUser.email,
      role: userRole // Use role from user_roles table
    }; 
    
    console.log(`[AuthMiddleware] User ${authUser.id} authenticated. Role: ${userRole || 'N/A'}`);
    next(); // Proceed to the next middleware or route handler

  } catch (err: any) {
    console.error('[AuthMiddleware] Unexpected error during token validation:', err);
    res.status(500).json({ message: 'Internal server error during authentication.', details: err.message });
    return;
  }
}; 