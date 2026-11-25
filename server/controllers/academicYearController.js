'use strict';

const AcademicYear = require('../models/AcademicYear');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const auditService = require('../services/auditService');

/**
 * @desc    Create a new academic year
 * @route   POST /api/v1/academic-years
 * @access  Private (Main Admin only)
 */
const createAcademicYear = asyncHandler(async (req, res) => {
  const { name, startDate, endDate, semesters, isActive } = req.body;

  // Check duplicate
  const existing = await AcademicYear.findOne({ name });
  if (existing) {
    throw new ApiError(400, `Academic year "${name}" already exists.`);
  }

  const academicYear = await AcademicYear.create({
    name,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    semesters: semesters.map((s) => ({
      name: s.name,
      startDate: s.startDate ? new Date(s.startDate) : undefined,
      endDate: s.endDate ? new Date(s.endDate) : undefined,
    })),
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id,
  });

  // Audit log
  await auditService.createLog({
    userId: req.user._id,
    username: req.user.username,
    role: req.user.role,
    action: 'ACADEMIC_YEAR_CREATED',
    entityType: 'AcademicYear',
    entityId: academicYear._id,
    newValues: { name, semesters: semesters.map((s) => s.name) },
    ipAddress: req.ip,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { academicYear }, 'Academic year created successfully.'));
});

/**
 * @desc    Get all academic years
 * @route   GET /api/v1/academic-years
 * @access  Private (Admin, Main Admin)
 */
const getAcademicYears = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const academicYears = await AcademicYear.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName username')
    .lean();

  res
    .status(200)
    .json(new ApiResponse(200, { academicYears }, 'Academic years retrieved successfully.'));
});

/**
 * @desc    Get a single academic year
 * @route   GET /api/v1/academic-years/:id
 * @access  Private (Admin, Main Admin)
 */
const getAcademicYear = asyncHandler(async (req, res) => {
  const academicYear = await AcademicYear.findById(req.params.id)
    .populate('createdBy', 'fullName username')
    .lean();

  if (!academicYear) {
    throw new ApiError(404, 'Academic year not found.');
  }

  res
    .status(200)
    .json(new ApiResponse(200, { academicYear }, 'Academic year retrieved successfully.'));
});

/**
 * @desc    Update an academic year
 * @route   PUT /api/v1/academic-years/:id
 * @access  Private (Main Admin only)
 */
const updateAcademicYear = asyncHandler(async (req, res) => {
  let academicYear = await AcademicYear.findById(req.params.id);

  if (!academicYear) {
    throw new ApiError(404, 'Academic year not found.');
  }

  const previousValues = {
    name: academicYear.name,
    isActive: academicYear.isActive,
    semesters: academicYear.semesters.map((s) => s.name),
  };

  // Check for duplicate name if changed
  if (req.body.name && req.body.name !== academicYear.name) {
    const dup = await AcademicYear.findOne({ name: req.body.name });
    if (dup) {
      throw new ApiError(400, `Academic year "${req.body.name}" already exists.`);
    }
  }

  // Update fields
  if (req.body.name) academicYear.name = req.body.name;
  if (req.body.startDate) academicYear.startDate = new Date(req.body.startDate);
  if (req.body.endDate) academicYear.endDate = new Date(req.body.endDate);
  if (req.body.isActive !== undefined) academicYear.isActive = req.body.isActive;

  if (req.body.semesters) {
    academicYear.semesters = req.body.semesters.map((s) => ({
      name: s.name,
      startDate: s.startDate ? new Date(s.startDate) : undefined,
      endDate: s.endDate ? new Date(s.endDate) : undefined,
    }));
  }

  await academicYear.save();

  // Audit log
  await auditService.createLog({
    userId: req.user._id,
    username: req.user.username,
    role: req.user.role,
    action: 'ACADEMIC_YEAR_UPDATED',
    entityType: 'AcademicYear',
    entityId: academicYear._id,
    previousValues,
    newValues: {
      name: academicYear.name,
      isActive: academicYear.isActive,
      semesters: academicYear.semesters.map((s) => s.name),
    },
    ipAddress: req.ip,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { academicYear }, 'Academic year updated successfully.'));
});

/**
 * @desc    Delete an academic year (soft-delete via isActive = false)
 * @route   DELETE /api/v1/academic-years/:id
 * @access  Private (Main Admin only)
 */
const deleteAcademicYear = asyncHandler(async (req, res) => {
  const academicYear = await AcademicYear.findById(req.params.id);

  if (!academicYear) {
    throw new ApiError(404, 'Academic year not found.');
  }

  academicYear.isActive = false;
  await academicYear.save();

  await auditService.createLog({
    userId: req.user._id,
    username: req.user.username,
    role: req.user.role,
    action: 'ACADEMIC_YEAR_UPDATED',
    entityType: 'AcademicYear',
    entityId: academicYear._id,
    previousValues: { isActive: true },
    newValues: { isActive: false },
    reason: 'Academic year deactivated',
    ipAddress: req.ip,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Academic year deactivated successfully.'));
});

module.exports = {
  createAcademicYear,
  getAcademicYears,
  getAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
};
