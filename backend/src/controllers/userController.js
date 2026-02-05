import { User, Booking } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get user's booking stats
  const bookingStats = await Booking.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        upcomingBookings: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed']] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = bookingStats[0] || {
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
  };

  res.json({
    success: true,
    data: {
      user: user.toSafeObject(),
      stats,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, dateOfBirth, gender } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone || null;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
  if (gender !== undefined) updateData.gender = gender || null;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

// @desc    Upload/Update avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image', 400);
  }

  // Select +avatarPublicId to access the hidden field for deletion
  const user = await User.findById(req.user._id).select('+avatarPublicId');

  // Delete old avatar from Cloudinary if exists
  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId).catch(console.error);
  } else if (user.avatar) {
    const publicId = getPublicIdFromUrl(user.avatar);
    if (publicId) {
      await deleteImage(publicId).catch(console.error);
    }
  }

  // Update user avatar with URL and public ID
  user.avatar = req.file.path;
  user.avatarPublicId = req.file.filename;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

// @desc    Delete avatar
// @route   DELETE /api/users/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req, res) => {
  // Select +avatarPublicId to access the hidden field for deletion
  const user = await User.findById(req.user._id).select('+avatarPublicId');

  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId).catch(console.error);
  } else if (user.avatar) {
    const publicId = getPublicIdFromUrl(user.avatar);
    if (publicId) {
      await deleteImage(publicId).catch(console.error);
    }
  }

  user.avatar = null;
  user.avatarPublicId = null;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Avatar deleted successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check if user uses local auth
  if (user.authProvider !== 'local') {
    throw new AppError('Password change is not available for social login accounts', 400);
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// ============ Admin Routes ============

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users: users.map(user => user.toSafeObject()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's bookings
  const bookings = await Booking.find({ user: user._id })
    .populate('services')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      user: user.toSafeObject(),
      recentBookings: bookings,
    },
  });
});

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role, position } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, position: role === 'admin' ? position : null },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

// @desc    Deactivate user (Admin)
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = asyncHandler(async (req, res) => {
  // Prevent self-deactivation
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User deactivated successfully',
  });
});

// @desc    Activate user (Admin)
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User activated successfully',
  });
});
