'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Map of userId -> Set of socket IDs
 * Tracks which sockets belong to which user
 */
const userSockets = new Map();

/**
 * Initialize Socket.IO handlers
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Track user's socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join a room based on user ID for targeted notifications
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
};

/**
 * Send notification to a specific user
 * @param {import('socket.io').Server} io - Socket.IO server
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification data
 */
const sendToUser = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

/**
 * Send notification to all users with a specific role
 * @param {import('socket.io').Server} io - Socket.IO server
 * @param {string} role - Target role
 * @param {object} notification - Notification data
 */
const sendToRole = (io, role, notification) => {
  // We'll iterate through connected sockets - in a 2-user system this is efficient
  for (const [, socket] of io.sockets.sockets) {
    if (socket.userRole === role) {
      socket.emit('notification', notification);
    }
  }
};

module.exports = { initializeSocket, sendToUser, sendToRole, userSockets };
