'use strict';

const mongoose = require('mongoose');

const semesterFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
      // e.g., "Semester 1 - 2026-2027"
    },
    totalFee: {
      type: Number,
      required: [true, 'Total fee is required'],
      min: [0, 'Total fee cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingFee: {
      type: Number,
      default: 0,
      min: [0, 'Remaining fee cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
      default: 'Unpaid',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one fee record per student per semester
semesterFeeSchema.index({ student: 1, semester: 1 }, { unique: true });
semesterFeeSchema.index({ semester: 1, status: 1 });

// Auto-calculate remaining fee and status before save
semesterFeeSchema.pre('save', function (next) {
  this.remainingFee = this.totalFee - this.paidAmount;
  if (this.remainingFee < 0) this.remainingFee = 0;

  if (this.paidAmount <= 0) {
    this.status = 'Unpaid';
  } else if (this.paidAmount >= this.totalFee) {
    this.status = 'Fully Paid';
    this.remainingFee = 0;
  } else {
    this.status = 'Partially Paid';
  }
  next();
});

module.exports = mongoose.model('SemesterFee', semesterFeeSchema);
