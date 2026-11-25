'use strict';

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    ledgerNo: {
      type: String,
      trim: true,
      default: '',
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    motherName: {
      type: String,
      trim: true,
      default: '',
    },
    enrollmentNo: {
      type: String,
      required: [true, 'Enrollment number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    admissionNo: {
      type: String,
      trim: true,
      default: '',
    },
    mediumOfAdmission: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    batch: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.index({ studentName: 'text', enrollmentNo: 'text' });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
