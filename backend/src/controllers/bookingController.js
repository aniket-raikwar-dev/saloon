import { Booking, Service, User } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { services, date, time, notes } = req.body;

  // Validate services exist
  const servicesDocs = await Service.find({ 
    _id: { $in: services }, 
    isActive: true 
  });

  if (servicesDocs.length !== services.length) {
    throw new AppError('One or more services are invalid or inactive', 400);
  }

  // Calculate total amount
  const totalAmount = servicesDocs.reduce((sum, service) => sum + service.price, 0);

  // Get service names for quick display
  const serviceNames = servicesDocs.map(service => service.name);

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    userName: req.user.name,
    userPhone: req.user.phone || '',
    userEmail: req.user.email,
    services,
    serviceNames,
    date: new Date(date),
    time,
    totalAmount,
    notes,
    status: 'pending',
  });

  // Populate services for response
  await booking.populate('services');

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      booking,
    },
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  
  if (status && status !== 'all') {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('services')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('services')
    .populate('user', 'name email phone avatar')
    .populate('processedBy', 'name');

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if user owns the booking or is admin
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this booking', 403);
  }

  res.json({
    success: true,
    data: {
      booking,
    },
  });
});

// @desc    Cancel booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if user owns the booking
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  // Check if booking can be cancelled
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new AppError(`Booking cannot be cancelled. Current status: ${booking.status}`, 400);
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellationReason = reason;
  booking.cancelledBy = req.user.role === 'admin' ? 'admin' : 'user';
  await booking.save();

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: {
      booking,
    },
  });
});

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
export const rescheduleBooking = asyncHandler(async (req, res) => {
  const { date, time } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if user owns the booking or is admin
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to reschedule this booking', 403);
  }

  // Check if booking can be rescheduled
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new AppError(`Booking cannot be rescheduled. Current status: ${booking.status}`, 400);
  }

  // Update booking
  booking.date = new Date(date);
  booking.time = time;
  booking.status = 'pending'; // Reset to pending after reschedule
  await booking.save();

  await booking.populate('services');

  res.json({
    success: true,
    message: 'Booking rescheduled successfully',
    data: {
      booking,
    },
  });
});

// ============ Admin Routes ============

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, date, search } = req.query;

  const query = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { userPhone: { $regex: search, $options: 'i' } },
      { bookingId: { $regex: search, $options: 'i' } },
    ];
  }

  const bookings = await Booking.find(query)
    .populate('services')
    .populate('user', 'name email phone avatar')
    .sort({ scheduledAt: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get today's bookings (Admin)
// @route   GET /api/bookings/today
// @access  Private/Admin
export const getTodayBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.getToday();

  res.json({
    success: true,
    data: {
      bookings,
    },
  });
});

// @desc    Get upcoming bookings (Admin)
// @route   GET /api/bookings/upcoming
// @access  Private/Admin
export const getUpcomingBookings = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const bookings = await Booking.getUpcoming(parseInt(limit));

  res.json({
    success: true,
    data: {
      bookings,
    },
  });
});

// @desc    Get pending bookings (Admin)
// @route   GET /api/bookings/pending
// @access  Private/Admin
export const getPendingBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.getByStatus('pending');

  res.json({
    success: true,
    data: {
      bookings,
    },
  });
});

// @desc    Get booking stats (Admin)
// @route   GET /api/bookings/stats
// @access  Private/Admin
export const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await Booking.getStats();

  res.json({
    success: true,
    data: {
      stats,
    },
  });
});

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Update booking
  booking.status = status;
  booking.processedBy = req.user._id;
  booking.processedAt = new Date();

  if (status === 'cancelled' && cancellationReason) {
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = 'admin';
  }

  await booking.save();
  await booking.populate('services');

  res.json({
    success: true,
    message: `Booking ${status} successfully`,
    data: {
      booking,
    },
  });
});

// @desc    Confirm booking (Admin)
// @route   PUT /api/bookings/:id/confirm
// @access  Private/Admin
export const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== 'pending') {
    throw new AppError(`Cannot confirm booking with status: ${booking.status}`, 400);
  }

  booking.status = 'confirmed';
  booking.processedBy = req.user._id;
  booking.processedAt = new Date();
  await booking.save();

  await booking.populate('services');

  res.json({
    success: true,
    message: 'Booking confirmed successfully',
    data: {
      booking,
    },
  });
});

// @desc    Complete booking (Admin)
// @route   PUT /api/bookings/:id/complete
// @access  Private/Admin
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== 'confirmed') {
    throw new AppError(`Cannot complete booking with status: ${booking.status}`, 400);
  }

  booking.status = 'completed';
  booking.processedBy = req.user._id;
  booking.processedAt = new Date();
  await booking.save();

  await booking.populate('services');

  res.json({
    success: true,
    message: 'Booking marked as completed',
    data: {
      booking,
    },
  });
});
