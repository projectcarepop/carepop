import express, { Router, RequestHandler } from 'express';
import { registerUser, loginUser } from '../controllers/authController'; // Added loginUser

const router: Router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser as RequestHandler);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser as RequestHandler); // Added login route

// Add other auth routes like /login later

export default router; 