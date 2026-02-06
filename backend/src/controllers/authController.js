import { User } from '../models/index.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import firebaseAdmin from '../config/firebase.js';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      authProvider: 'local',
    };

    // Only include phone if it's provided and not empty
    if (phone && phone.trim() && phone.trim().length > 0) {
      userData.phone = phone.trim();
    }

    // Create user
    const user = await User.create(userData);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toSafeObject(),
        accessToken,
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error('Registration Error:', error);
    throw error; // Re-throw to be handled by errorHandler
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user used social login
  if (user.authProvider !== 'local') {
    throw new AppError(`Please sign in with ${user.authProvider}`, 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token and update last login
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toSafeObject(),
      accessToken,
    },
  });
});

// @desc    Google Sign In
// @route   POST /api/auth/google
// @access  Public
export const googleSignIn = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!firebaseAdmin) {
    throw new AppError('Google Sign-In is not configured', 500);
  }

  // Verify Firebase ID token
  let decodedToken;
  try {
    decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase token verification error:', error);
    throw new AppError('Invalid Google token', 401);
  }

  const { uid, email, name, picture } = decodedToken;

  // Find or create user
  let user = await User.findOne({ 
    $or: [
      { firebaseUid: uid },
      { email: email.toLowerCase() }
    ]
  });

  if (user) {
    // Update user info if needed
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.authProvider = 'google';
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
    }
  } else {
    // Create new user
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      firebaseUid: uid,
      authProvider: 'google',
      avatar: picture,
      isEmailVerified: true,
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token and update last login
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    message: 'Google Sign-In successful',
    data: {
      user: user.toSafeObject(),
      accessToken,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token not found', 401);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Find user with refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new tokens
  const tokens = generateTokens(user._id);

  // Update refresh token in database
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token in database
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  // Clear cookies
  res.cookie('accessToken', '', { ...cookieOptions, maxAge: 0 });
  res.cookie('refreshToken', '', { ...cookieOptions, maxAge: 0 });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user: user.toSafeObject(),
    },
  });
});

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findByEmail(email);
  
  res.json({
    success: true,
    data: {
      exists: !!user,
      authProvider: user?.authProvider,
    },
  });
});
