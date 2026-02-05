import express from 'express';
import {
  register,
  login,
  googleSignIn,
  refreshAccessToken,
  logout,
  getMe,
  checkEmail,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validate,
  registerValidation,
  loginValidation,
  googleAuthValidation,
} from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/google', googleAuthValidation, validate, googleSignIn);
router.post('/refresh', refreshAccessToken);
router.post('/check-email', checkEmail);

// Protected routes
router.use(protect); // All routes below require authentication
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
