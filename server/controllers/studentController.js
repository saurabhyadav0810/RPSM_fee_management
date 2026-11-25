'use strict';

const Student = require('../models/Student');
const SemesterFee = require('../models/SemesterFee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const buildPagination = require('../utils/pagination');

/**
 * @desc    Add a new student with semester fee
 * @route   POST /api/v1/students
 * @access  Private
 */
const createStudent = asyncHandler(async (req, res) => {
  const {
    ledgerNo, studentName, fatherName, motherName,
    enrollmentNo, admissionNo, mediumOfAdmission,
    course, batch, totalFee, semester,
  } = req.body;

  if (!enrollmentNo || !studentName) {
    throw new ApiError(400, 'Enrollment No and Student Name are required.');
  }

  // Check duplicate enrollment
  const existing = await Student.findOne({ enrollmentNo: enrollmentNo.toUpperCase() });
  if (existing) {
    throw new ApiError(400, 'Enrollment number already exists.');
  }

  // Create student
  const student = await Student.create({
    ledgerNo: ledgerNo || '',
    studentName,
    fatherName: fatherName || '',
    motherName: motherName || '',
    enrollmentNo: enrollmentNo.toUpperCase(),
    admissionNo: admissionNo || '',
    mediumOfAdmission: mediumOfAdmission || '',
    course: course || '',
    batch: batch || '',
  });

  // Create semester fee record if totalFee and semester provided
  let semesterFee = null;
  if (totalFee && semester) {
    semesterFee = await SemesterFee.create({
      student: student._id,
      semester,
      totalFee: Number(totalFee),
      paidAmount: 0,
    });
  }

  res.status(201).json(
    new ApiResponse(201, { student, semesterFee }, 'Student added successfully.')
  );
});

/**
 * @desc    Get all students with search and pagination
 * @route   GET /api/v1/students
 * @access  Private
 */
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { enrollmentNo: { $regex: search, $options: 'i' } },
      { admissionNo: { $regex: search, $options: 'i' } },
      { ledgerNo: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) filter.status = status;

  const total = await Student.countDocuments(filter);
  const { skip, limit: perPage, pagination } = buildPagination(page, limit, total);

  const students = await Student.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .lean();

  // Attach fee info for each student
  const studentIds = students.map((s) => s._id);
  const fees = await SemesterFee.find({ student: { $in: studentIds } }).lean();

  const studentsWithFees = students.map((s) => {
    const studentFees = fees.filter((f) => f.student.toString() === s._id.toString());
    const totalFee = studentFees.reduce((sum, f) => sum + f.totalFee, 0);
    const totalPaid = studentFees.reduce((sum, f) => sum + f.paidAmount, 0);
    return {
      ...s,
      totalFee,
      totalPaid,
      totalRemaining: totalFee - totalPaid,
      semesters: studentFees,
    };
  });

  res.status(200).json(
    new ApiResponse(200, { students: studentsWithFees, pagination }, 'Students retrieved.')
  );
});

/**
 * @desc    Get single student with all fee details
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).lean();
  if (!student) throw new ApiError(404, 'Student not found.');

  const fees = await SemesterFee.find({ student: student._id }).sort({ createdAt: -1 }).lean();

  res.status(200).json(
    new ApiResponse(200, { student, fees }, 'Student retrieved.')
  );
});

/**
 * @desc    Update student details and/or fee
 * @route   PUT /api/v1/students/:id
 * @access  Private
 */
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');

  const {
    studentName, fatherName, motherName, ledgerNo,
    admissionNo, mediumOfAdmission, course, batch,
    status, totalFee, semester,
  } = req.body;

  // Update student fields
  if (studentName !== undefined) student.studentName = studentName;
  if (fatherName !== undefined) student.fatherName = fatherName;
  if (motherName !== undefined) student.motherName = motherName;
  if (ledgerNo !== undefined) student.ledgerNo = ledgerNo;
  if (admissionNo !== undefined) student.admissionNo = admissionNo;
  if (mediumOfAdmission !== undefined) student.mediumOfAdmission = mediumOfAdmission;
  if (course !== undefined) student.course = course;
  if (batch !== undefined) student.batch = batch;
  if (status !== undefined) student.status = status;

  await student.save();

  // Update semester fee if provided
  let semesterFee = null;
  if (semester && totalFee !== undefined) {
    semesterFee = await SemesterFee.findOne({ student: student._id, semester });
    if (semesterFee) {
      // Validate: new total fee must not be less than already paid
      if (Number(totalFee) < semesterFee.paidAmount) {
        throw new ApiError(
          400,
          `Cannot set total fee to ₹${totalFee}. Student has already paid ₹${semesterFee.paidAmount}.`
        );
      }
      semesterFee.totalFee = Number(totalFee);
      await semesterFee.save();
    } else {
      // Create new semester fee record
      semesterFee = await SemesterFee.create({
        student: student._id,
        semester,
        totalFee: Number(totalFee),
        paidAmount: 0,
      });
    }
  }

  res.status(200).json(
    new ApiResponse(200, { student, semesterFee }, 'Student updated successfully.')
  );
});

/**
 * @desc    Search students by name or enrollment no (for pay fee autocomplete)
 * @route   GET /api/v1/students/search
 * @access  Private
 */
const searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json(new ApiResponse(200, { students: [] }, 'Provide search term.'));
  }

  const students = await Student.find({
    status: 'Active',
    $or: [
      { studentName: { $regex: q, $options: 'i' } },
      { enrollmentNo: { $regex: q, $options: 'i' } },
      { admissionNo: { $regex: q, $options: 'i' } },
    ],
  })
    .limit(10)
    .lean();

  res.status(200).json(new ApiResponse(200, { students }, 'Search results.'));
});

module.exports = { createStudent, getStudents, getStudent, updateStudent, searchStudents };
