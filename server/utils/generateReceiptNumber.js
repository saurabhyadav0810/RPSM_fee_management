'use strict';

/**
 * Generate a unique receipt number
 * Format: RCP-YYYYMMDD-XXXXX (e.g., RCP-20261123-00001)
 * @param {number} sequence - Sequential number for the day
 * @returns {string} Unique receipt number
 */
const generateReceiptNumber = (sequence = 1) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(5, '0');
  return `RCP-${year}${month}${day}-${seq}`;
};

module.exports = generateReceiptNumber;
