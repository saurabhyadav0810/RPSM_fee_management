'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication middleware - verifies JWT from HTTP-only cookie
 */
const auth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User not found. Please log in again.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account is deactivated. Contact the administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired token. Please log in again.');
  }
});

module.exports = auth;
