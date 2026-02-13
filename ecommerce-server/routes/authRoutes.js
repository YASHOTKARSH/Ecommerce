const express = require('express');
const Joi = require('joi');
const {
  register,
  login,
  getMe,
  protectedRoute,
  adminOnlyRoute,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().required().min(8).messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(8).messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
});

// Routes with strict rate limiting for auth endpoints
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', auth, getMe);
router.get('/protected', auth, protectedRoute);
router.get('/admin-only', auth, roleAuth('admin'), adminOnlyRoute);

module.exports = router;
