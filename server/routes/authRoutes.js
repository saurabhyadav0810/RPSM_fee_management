'use strict';

const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/authValidator');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

module.exports = router;
