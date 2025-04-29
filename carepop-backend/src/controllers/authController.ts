import { Request, Response, NextFunction } from 'express';
import { registerUserService, loginUserService } from '../services/authService';

// We will add the call to the service layer later
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Input validation (email, password)
    console.log('Register request body:', req.body); // Log for now

    // Call the AuthService
    const result = await registerUserService(req.body);

    // Send the service response
    // Handle potential errors returned from the service
    if (!result.success) {
      // Determine appropriate status code based on error type if possible
      // For now, using 400 for general client errors from the service
      return res.status(400).json(result); 
    }

    res.status(201).json(result); 
  } catch (error: any) { // Added type annotation for caught error
    console.error('Registration Error:', error);
    // Pass error to the centralized error handler (to be implemented)
    // Check if it's an error thrown by our validation
    if (error.message === 'Email and password are required.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error); 
  }
};

// Login User Controller
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Add more robust input validation (e.g., using a library like Joi or validator.js)
    console.log('Login request body:', req.body);

    // Call the Login Service
    const result = await loginUserService(req.body);

    // Handle potential errors returned from the service
    if (!result.success) {
      // Check for specific Supabase auth errors if needed
      if (result.error?.message === 'Invalid login credentials') {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      // General service error
      return res.status(400).json(result);
    }

    // Send the successful login response (including user and session/token)
    res.status(200).json(result);

  } catch (error: any) {
    console.error('Login Error:', error);
    // Handle validation error thrown by service
    if (error.message === 'Email and password are required.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Pass other errors to the centralized error handler
    next(error);
  }
}; 