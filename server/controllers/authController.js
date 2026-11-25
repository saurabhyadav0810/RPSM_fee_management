'use strict';

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const auditService = require('../services/auditService');

/**
 * Get cookie options for JWT token
 * @returns {object} Cookie options
 */
const getCookieOptions = () => {
  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10) || 7;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,
  };
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user by username and explicitly include password
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated. Contact the administrator.');
  }

  // Compare passwords
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  // Generate token
  const token = user.generateAuthToken();

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Audit log - login
  try {
    await auditService.createLog({
      userId: user._id,
      username: user.username,
      role: user.role,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Failed to create login audit log:', err.message);
  }

  // Send response with cookie
  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
  };

  res
    .status(200)
    .cookie('token', token, getCookieOptions())
    .json(new ApiResponse(200, { user: userData }, 'Login successful.'));
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Audit log - logout
  try {
    await auditService.createLog({
      userId: req.user._id,
      username: req.user.username,
      role: req.user.role,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: req.user._id,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Failed to create logout audit log:', err.message);
  }

  res
    .status(200)
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    })
    .json(new ApiResponse(200, null, 'Logged out successfully.'));
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.status(200).json(new ApiResponse(200, { user }, 'User profile retrieved.'));
});

module.exports = { login, logout, getMe };
