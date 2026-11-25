'use strict';

/**
 * Build pagination metadata
 * @param {number} page - Current page (1-based)
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {{ skip: number, pagination: object }}
 */
const buildPagination = (page = 1, limit = 10, total = 0) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const totalPages = Math.ceil(total / perPage);
  const skip = (currentPage - 1) * perPage;

  const pagination = {
    currentPage,
    perPage,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  return { skip, limit: perPage, pagination };
};

module.exports = buildPagination;
