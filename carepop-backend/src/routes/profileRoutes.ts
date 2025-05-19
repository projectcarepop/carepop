import express from 'express';
import * as profileController from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   PATCH /api/users/profile
 * @desc    Update authenticated user's profile
 * @access  Private (requires Bearer token)
 * 
 * @body    UpdateProfileDto (firstName?, middleInitial?, lastName?, dateOfBirth?, ...etc)
 */
router.patch(
  '/profile', 
  authenticateToken, 
  profileController.handleUpdateUserProfile
);

// You can add other profile-related routes here if needed in the future, e.g.:
router.get('/profile', authenticateToken, profileController.handleGetUserProfile);

export default router; 