import { Request, Response, NextFunction } from 'express';
import { registerUserService } from '../services/authService';

// We will add the call to the service layer later
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Input validation (email, password)
    console.log('Register request body:', req.body); // Log for now

    // Call the AuthService
    const result = await registerUserService(req.body);

    // Send the service response
    res.status(201).json(result); 
  } catch (error) {
    console.error('Registration Error:', error);
    // Pass error to the centralized error handler (to be implemented)
    next(error); 
  }
}; 