'use strict';

const express = require('express');
const router = express.Router();
const {
  createAcademicYear,
  getAcademicYears,
  getAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} = require('../controllers/academicYearController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createAcademicYearSchema,
  updateAcademicYearSchema,
} = require('../validators/academicYearValidator');

// All routes require authentication
router.use(auth);

router
  .route('/')
  .get(getAcademicYears)
  .post(authorize('main_admin'), validate(createAcademicYearSchema), createAcademicYear);

router
  .route('/:id')
  .get(getAcademicYear)
  .put(authorize('main_admin'), validate(updateAcademicYearSchema), updateAcademicYear)
  .delete(authorize('main_admin'), deleteAcademicYear);

module.exports = router;
