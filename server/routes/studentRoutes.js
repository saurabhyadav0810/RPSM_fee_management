'use strict';

const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getStudent, updateStudent, searchStudents } = require('../controllers/studentController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/search', searchStudents);
router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent);

module.exports = router;
