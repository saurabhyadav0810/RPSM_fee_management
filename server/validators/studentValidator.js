'use strict';

const { z } = require('zod');

const createStudentSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .min(1, 'Student ID is required')
    .max(50, 'Student ID cannot exceed 50 characters')
    .trim(),
  admissionNumber: z
    .string({ required_error: 'Admission number is required' })
    .min(1, 'Admission number is required')
    .max(50, 'Admission number cannot exceed 50 characters')
    .trim(),
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
  class: z
    .string({ required_error: 'Class is required' })
    .min(1, 'Class is required')
    .max(50, 'Class cannot exceed 50 characters')
    .trim(),
  section: z
    .string({ required_error: 'Section is required' })
    .min(1, 'Section is required')
    .max(10, 'Section cannot exceed 10 characters')
    .trim(),
  rollNumber: z
    .string({ required_error: 'Roll number is required' })
    .min(1, 'Roll number is required')
    .max(20, 'Roll number cannot exceed 20 characters')
    .trim(),
  academicYear: z
    .string({ required_error: 'Academic year is required' })
    .min(1, 'Academic year is required')
    .trim(),
  dateOfBirth: z
    .string()
    .optional()
    .nullable(),
  guardianName: z
    .string({ required_error: 'Guardian name is required' })
    .min(1, 'Guardian name is required')
    .max(100, 'Guardian name cannot exceed 100 characters')
    .trim(),
  contactNumber: z
    .string({ required_error: 'Contact number is required' })
    .min(7, 'Contact number must be at least 7 characters')
    .max(20, 'Contact number cannot exceed 20 characters')
    .trim(),
  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional()
    .nullable(),
  admissionDate: z
    .string({ required_error: 'Admission date is required' })
    .min(1, 'Admission date is required'),
  status: z
    .enum(['Active', 'Inactive', 'Graduated', 'Transferred'])
    .optional()
    .default('Active'),
  profilePhoto: z
    .string()
    .optional()
    .nullable(),
});

const updateStudentSchema = createStudentSchema.partial().omit({ studentId: true });

module.exports = { createStudentSchema, updateStudentSchema };
