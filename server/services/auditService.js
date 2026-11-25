'use strict';

const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {object} data - Audit log data
 * @param {string} data.userId - User ID who performed the action
 * @param {string} data.username - Username
 * @param {string} data.role - User role
 * @param {string} data.action - Action performed
 * @param {string} [data.entityType] - Type of entity affected
 * @param {string} [data.entityId] - ID of entity affected
 * @param {object} [data.previousValues] - Previous values before change
 * @param {object} [data.newValues] - New values after change
 * @param {string} [data.reason] - Reason for the action
 * @param {string} [data.ipAddress] - IP address of the request
 * @returns {Promise<object>} Created audit log entry
 */
const createLog = async (data) => {
  try {
    const log = await AuditLog.create({
      user: data.userId,
      username: data.username,
      role: data.role,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      previousValues: data.previousValues,
      newValues: data.newValues,
      reason: data.reason,
      ipAddress: data.ipAddress,
    });
    return log;
  } catch (error) {
    // Audit logging should never cause the main operation to fail
    console.error('Audit log creation failed:', error.message);
    return null;
  }
};

module.exports = { createLog };
