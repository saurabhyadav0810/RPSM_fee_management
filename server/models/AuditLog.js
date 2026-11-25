'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: {
      type: String,
    },
    role: {
      type: String,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'LOGIN',
        'LOGOUT',
        'STUDENT_CREATED',
        'STUDENT_UPDATED',
        'SEMESTER_FEE_CREATED',
        'PAYMENT_RECORDED',
        'PAYMENT_CORRECTED',
        'PAYMENT_REVERSED',
        'FEE_MODIFICATION_REQUESTED',
        'FEE_MODIFICATION_APPROVED',
        'FEE_MODIFICATION_REJECTED',
        'ACADEMIC_YEAR_CREATED',
        'ACADEMIC_YEAR_UPDATED',
        'FEE_STRUCTURE_CREATED',
        'FEE_STRUCTURE_UPDATED',
        'FEE_STRUCTURE_DELETED',
      ],
    },
    entityType: {
      type: String,
      enum: ['User', 'Student', 'SemesterFee', 'Payment', 'FeeModificationRequest', 'AcademicYear', 'FeeStructure', 'PaymentCorrection'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    previousValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    reason: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
