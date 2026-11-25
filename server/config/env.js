'use strict';

/**
 * Centralized environment configuration
 */
const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/school-fee-management',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  COOKIE_EXPIRE: parseInt(process.env.COOKIE_EXPIRE, 10) || 7,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

module.exports = config;
