import { Request, Response } from 'express';
import { AuthService } from '@/services/public/authService';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';

const authService = new AuthService();

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  
  const { user, session } = await authService.signUp(email, password, firstName, lastName);

  if (!user || !session) {
    throw new Error('Sign up failed to return user or session.');
  }

  const responseData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata.first_name,
      lastName: user.user_metadata.last_name,
    },
    session,
  };

  res.status(201).json(new ApiResponse(201, responseData, 'User created successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, session } = await authService.login(email, password);
  
  if (!user || !session) {
    throw new Error('Login failed to return user or session.');
  }

  const responseData = {
    user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata.first_name,
        lastName: user.user_metadata.last_name,
    },
    session,
  };

  res.status(200).json(new ApiResponse(200, responseData, 'Login successful'));
}); 