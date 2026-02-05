import { validationResult, body, param, query } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

// Auth validation rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Please enter a valid phone number'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const googleAuthValidation = [
  body('idToken')
    .notEmpty().withMessage('Google ID token is required'),
];

// User validation rules
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      return /^[\+]?[0-9]{10,15}$/.test(value);
    })
    .withMessage('Please enter a valid phone number (10-15 digits)'),
  body('dateOfBirth')
    .optional({ values: 'null' })
    .custom((value) => {
      if (!value || value === '') return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) return false;
      // Must be in the past and at least 10 years old
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 10);
      return date <= minAge;
    })
    .withMessage('Please enter a valid date of birth (must be at least 10 years old)'),
  body('gender')
    .optional({ values: 'null' })
    .custom((value) => {
      if (!value || value === '') return true;
      return ['female', 'male', 'other', 'prefer-not-to-say'].includes(value);
    })
    .withMessage('Invalid gender value'),
];

// Booking validation rules
export const createBookingValidation = [
  body('services')
    .isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*')
    .isMongoId().withMessage('Invalid service ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).withMessage('Invalid time format (e.g., 09:00 AM)'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

export const updateBookingStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status'),
  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason cannot exceed 500 characters'),
];

export const rescheduleBookingValidation = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).withMessage('Invalid time format'),
];

// ID validation
export const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
