import express from 'express';
import {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  getPopularServices,
  getCategories,
  createService,
  updateService,
  deleteService,
  getAllServicesAdmin,
} from '../controllers/serviceController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/categories', getCategories);
router.get('/popular', getPopularServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', mongoIdValidation, validate, getServiceById);

// Admin routes (protected)
router.use(protect);
router.use(adminOnly);

router.get('/admin/all', getAllServicesAdmin);
router.post('/', createService);
router.put('/:id', mongoIdValidation, validate, updateService);
router.delete('/:id', mongoIdValidation, validate, deleteService);

export default router;
