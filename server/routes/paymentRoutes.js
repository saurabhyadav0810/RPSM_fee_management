'use strict';

const express = require('express');
const router = express.Router();
const { recordPayment, getPayments, getCollectionSummary } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/summary', getCollectionSummary);
router.route('/').get(getPayments).post(recordPayment);

module.exports = router;
