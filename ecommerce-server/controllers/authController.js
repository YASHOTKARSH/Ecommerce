const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { validatePasswordStrength } = require('../utils/passwordValidator');
const { logAudit } = require('../middleware/auditLogger');

// Generate JWT Access Token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Generate JWT Refresh Token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// Set tokens in cookies
const sendTokenResponse = async (user, statusCode, res, req) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const accessTokenOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const refreshTokenOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('token', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions)
    .json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new ApiError(400, passwordValidation.errors.join('. '));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Log audit
  await logAudit(req, 'user.register', 'user', user._id, { email });

  await sendTokenResponse(user, 201, res, req);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked()) {
    await logAudit(req, 'user.login', 'user', user._id, { email, reason: 'account locked' }, 'failure');
    throw new ApiError(423, 'Account is locked due to too many failed login attempts. Please try again later.');
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    await logAudit(req, 'user.login', 'user', user._id, { email, reason: 'invalid password' }, 'failure');
    throw new ApiError(401, 'Invalid credentials');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    await user.resetLoginAttempts();
  }

  // Log audit
  await logAudit(req, 'user.login', 'user', user._id, { email });

  await sendTokenResponse(user, 200, res, req);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Protected route test
// @route   GET /api/auth/protected
// @access  Private
const protectedRoute = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this protected route',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// @desc    Admin only route test
// @route   GET /api/auth/admin-only
// @access  Private/Admin
const adminOnlyRoute = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'You have admin access',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token)
const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token not provided');
  }

  // Verify refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  );

  // Find user and check if refresh token matches
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const accessTokenOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const refreshTokenOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(200)
    .cookie('token', newAccessToken, accessTokenOptions)
    .cookie('refreshToken', newRefreshToken, refreshTokenOptions)
    .json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // In a real application, you would send an email here
  // For now, we'll just return the token (in production, never return this!)
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Log audit
  await logAudit(req, 'user.password_reset', 'user', user._id, { email });

  res.status(200).json({
    success: true,
    message: 'Password reset link has been sent to your email',
    // Remove this in production - only for development/testing
    ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl }),
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const resetToken = req.params.token;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new ApiError(400, passwordValidation.errors.join('. '));
  }

  // Hash token and find user
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // Invalidate all refresh tokens
  await user.save();

  // Log audit
  await logAudit(req, 'user.password_change', 'user', user._id, { method: 'reset' });

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
  });
});

module.exports = {
  register,
  login,
  getMe,
  protectedRoute,
  adminOnlyRoute,
  refreshToken,
  forgotPassword,
  resetPassword,
};
