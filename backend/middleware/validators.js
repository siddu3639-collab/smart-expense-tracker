const { body, param, query, validationResult } = require('express-validator');

// Handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number'),
  handleValidation,
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// Expense validators
const expenseValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['expense', 'income']).withMessage('Type must be expense or income'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  handleValidation,
];

// Budget validators
const budgetValidator = [
  body('category').notEmpty().withMessage('Category is required'),
  body('limit').isFloat({ min: 1 }).withMessage('Budget limit must be greater than 0'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020, max: 2100 }).withMessage('Invalid year'),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }).withMessage('Alert threshold must be 1-100'),
  handleValidation,
];

// Goal validators
const goalValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
  body('savedAmount').optional().isFloat({ min: 0 }).withMessage('Saved amount cannot be negative'),
  body('targetDate').isISO8601().withMessage('Valid target date is required'),
  handleValidation,
];

// ObjectId validator
const objectIdValidator = (field = 'id') => [
  param(field).isMongoId().withMessage(`Invalid ${field}`),
  handleValidation,
];

module.exports = {
  registerValidator,
  loginValidator,
  expenseValidator,
  budgetValidator,
  goalValidator,
  objectIdValidator,
  handleValidation,
};
