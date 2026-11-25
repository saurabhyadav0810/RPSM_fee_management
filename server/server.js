'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const config = require('./config/env');
const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const { initializeSocket } = require('./sockets/socketHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: config.CLIENT_URL, credentials: true },
});

app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/', apiRateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);
initializeSocket(io);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.PORT, () => {
      console.log(`\n🚀 Server running on port ${config.PORT}`);
      console.log(`📡 API: http://localhost:${config.PORT}/api/v1\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
