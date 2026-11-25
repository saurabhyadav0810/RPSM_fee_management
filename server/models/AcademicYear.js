'use strict';

const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { _id: true }
);

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Academic year name is required'],
      unique: true,
      trim: true,
      // e.g., "2026-2027"
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    semesters: {
      type: [semesterSchema],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one semester is required',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active academic year at a time (optional — allows multiple active)
academicYearSchema.index({ name: 1 }, { unique: true });
academicYearSchema.index({ isActive: 1 });

module.exports = mongoose.model('AcademicYear', academicYearSchema);
