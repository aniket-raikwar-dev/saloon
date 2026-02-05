import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadAvatar as uploadMiddleware } from '../config/cloudinary.js';
import {
  validate,
  updateProfileValidation,
  mongoIdValidation,
  paginationValidation,
} from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.post('/avatar', uploadMiddleware.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.put('/password', changePassword);

// Admin routes
router.get('/', adminOnly, paginationValidation, validate, getAllUsers);
router.get('/:id', adminOnly, mongoIdValidation, validate, getUserById);
router.put('/:id/role', adminOnly, mongoIdValidation, validate, updateUserRole);
router.put('/:id/deactivate', adminOnly, mongoIdValidation, validate, deactivateUser);
router.put('/:id/activate', adminOnly, mongoIdValidation, validate, activateUser);

export default router;
