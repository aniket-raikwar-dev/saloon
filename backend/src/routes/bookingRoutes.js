import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  getAllBookings,
  getTodayBookings,
  getUpcomingBookings,
  getPendingBookings,
  getBookingStats,
  updateBookingStatus,
  confirmBooking,
  completeBooking,
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  validate,
  createBookingValidation,
  updateBookingStatusValidation,
  rescheduleBookingValidation,
  mongoIdValidation,
  paginationValidation,
} from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createBookingValidation, validate, createBooking);
router.get('/my-bookings', paginationValidation, validate, getMyBookings);
router.get('/:id', mongoIdValidation, validate, getBookingById);
router.put('/:id/cancel', mongoIdValidation, validate, cancelBooking);
router.put('/:id/reschedule', rescheduleBookingValidation, validate, rescheduleBooking);

// Admin routes
router.get('/', adminOnly, paginationValidation, validate, getAllBookings);
router.get('/admin/today', adminOnly, getTodayBookings);
router.get('/admin/upcoming', adminOnly, getUpcomingBookings);
router.get('/admin/pending', adminOnly, getPendingBookings);
router.get('/admin/stats', adminOnly, getBookingStats);
router.put('/:id/status', adminOnly, updateBookingStatusValidation, validate, updateBookingStatus);
router.put('/:id/confirm', adminOnly, mongoIdValidation, validate, confirmBooking);
router.put('/:id/complete', adminOnly, mongoIdValidation, validate, completeBooking);

export default router;
