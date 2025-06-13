import { Request, Response } from 'express';
import { userService } from '../../services/public/user.service';

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
}; 