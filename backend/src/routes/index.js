import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import serviceRoutes from './serviceRoutes.js';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Glamour Studio API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      bookings: '/api/bookings',
      services: '/api/services',
    },
  });
});

export default router;
