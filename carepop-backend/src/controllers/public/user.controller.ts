import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/public/user.service';
import { AppError } from '../../lib/utils/appError';

export const userController = {
    getProfile: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const profile = await userService.getProfileById(userId);
            res.status(200).json(profile);
        } catch (error: any) {
            console.error('Get Profile Error:', error);
            res.status(404).json({ message: error.message || 'Profile not found.' });
        }
    },

    updateMyProfile: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // The user's ID is attached to the request by the auth middleware
            const userId = (req as any).user.id;
            if (!userId) {
                throw new AppError('Authentication error: User ID not found in token.', 401);
            }

            const profileData = req.body;
            
            // TODO: Add Zod validation for profileData

            const updatedProfile = await userService.updateProfile(userId, profileData);

            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully.',
                data: updatedProfile,
            });
        } catch (error) {
            next(error);
        }
    },
}; 