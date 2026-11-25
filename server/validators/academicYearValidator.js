'use strict';

const { z } = require('zod');

const semesterSchema = z.object({
  name: z.string().min(1, 'Semester name is required').trim(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

const createAcademicYearSchema = z.object({
  name: z
    .string({ required_error: 'Academic year name is required' })
    .min(1, 'Academic year name is required')
    .max(20, 'Name cannot exceed 20 characters')
    .trim(),
  startDate: z
    .string({ required_error: 'Start date is required' })
    .min(1, 'Start date is required'),
  endDate: z
    .string({ required_error: 'End date is required' })
    .min(1, 'End date is required'),
  semesters: z
    .array(semesterSchema)
    .min(1, 'At least one semester is required')
    .max(10, 'Cannot have more than 10 semesters'),
  isActive: z.boolean().optional().default(true),
});

const updateAcademicYearSchema = createAcademicYearSchema.partial();

module.exports = { createAcademicYearSchema, updateAcademicYearSchema };
