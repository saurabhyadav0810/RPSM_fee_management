'use strict';

const Payment = require('../models/Payment');
const SemesterFee = require('../models/SemesterFee');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Record a fee payment (atomic findOneAndUpdate to prevent overpayment)
 * @route   POST /api/v1/payments
 * @access  Private
 */
const recordPayment = asyncHandler(async (req, res) => {
  const { enrollmentNo, semester, amount, paymentMode, remarks } = req.body;

  const student = await Student.findOne({ enrollmentNo: enrollmentNo.toUpperCase() });
  if (!student) throw new ApiError(404, 'Student not found.');
  if (student.status !== 'Active') throw new ApiError(400, 'Student is not active.');

  const payAmount = Number(amount);
  if (!payAmount || payAmount <= 0) {
    throw new ApiError(400, 'Payment amount must be greater than ₹0.');
  }

  // Atomic update: only update if remaining fee >= payAmount
  const semesterFee = await SemesterFee.findOneAndUpdate(
    {
      student: student._id,
      semester,
      remainingFee: { $gte: payAmount },
    },
    {
      $inc: { paidAmount: payAmount },
    },
    { new: true }
  );

  if (!semesterFee) {
    const existing = await SemesterFee.findOne({ student: student._id, semester });
    if (!existing) {
      throw new ApiError(404, `No fee record found for "${semester}". Please add the fee first.`);
    }
    throw new ApiError(
      400,
      `Payment rejected. The entered amount ₹${payAmount.toLocaleString('en-IN')} exceeds the remaining fee of ₹${existing.remainingFee.toLocaleString('en-IN')}. Maximum payable amount is ₹${existing.remainingFee.toLocaleString('en-IN')}.`
    );
  }

  // Recalculate remaining and status via save (triggers pre-save hook)
  await semesterFee.save();

  // Generate receipt number
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await Payment.countDocuments();
  const receiptNumber = `RCP-${dateStr}-${String(count + 1).padStart(5, '0')}`;

  // Create payment record
  const payment = await Payment.create({
    student: student._id,
    semesterFee: semesterFee._id,
    semester,
    amount: payAmount,
    paymentDate: today,
    paymentMode: paymentMode || 'Cash',
    receiptNumber,
    remarks: remarks || '',
    recordedBy: req.user._id,
  });

  const populatedPayment = await Payment.findById(payment._id)
    .populate('student', 'enrollmentNo studentName')
    .populate('recordedBy', 'fullName')
    .lean();

  res.status(201).json(
    new ApiResponse(201, {
      payment: populatedPayment,
      updatedFee: {
        totalFee: semesterFee.totalFee,
        paidAmount: semesterFee.paidAmount,
        remainingFee: semesterFee.remainingFee,
        status: semesterFee.status,
      },
    }, 'Payment recorded successfully.')
  );
});

/**
 * @desc    Get payment history
 * @route   GET /api/v1/payments
 * @access  Private
 */
const getPayments = asyncHandler(async (req, res) => {
  const { semester, enrollmentNo, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (semester) filter.semester = semester;
  if (enrollmentNo) {
    const student = await Student.findOne({ enrollmentNo: enrollmentNo.toUpperCase() });
    if (student) filter.student = student._id;
  }

  const total = await Payment.countDocuments(filter);
  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  const payments = await Payment.find(filter)
    .populate('student', 'enrollmentNo studentName course batch')
    .populate('recordedBy', 'fullName')
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      payments,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Payments retrieved.')
  );
});

/**
 * @desc    Get fee collection summary
 * @route   GET /api/v1/payments/summary
 * @access  Private
 */
const getCollectionSummary = asyncHandler(async (req, res) => {
  const { semester, feeStatus } = req.query;
  const filter = {};
  if (semester) filter.semester = semester;
  if (feeStatus) filter.status = feeStatus;

  const fees = await SemesterFee.find(filter)
    .populate('student', 'enrollmentNo studentName course batch status')
    .sort({ status: 1 })
    .lean();

  // For summary stats, always use unfiltered-by-status data for the selected semester
  const summaryFilter = semester ? { semester } : {};
  const allFees = feeStatus
    ? await SemesterFee.find(summaryFilter).lean()
    : fees;

  const totalStudents = allFees.length;
  const totalFeeAmount = allFees.reduce((sum, f) => sum + f.totalFee, 0);
  const totalCollected = allFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = totalFeeAmount - totalCollected;
  const fullyPaid = allFees.filter((f) => f.status === 'Fully Paid').length;
  const partiallyPaid = allFees.filter((f) => f.status === 'Partially Paid').length;
  const unpaid = allFees.filter((f) => f.status === 'Unpaid').length;

  const semesters = await SemesterFee.distinct('semester');

  res.status(200).json(
    new ApiResponse(200, {
      summary: { totalStudents, totalFeeAmount, totalCollected, totalPending, fullyPaid, partiallyPaid, unpaid },
      fees,
      semesters,
    }, 'Collection summary retrieved.')
  );
});

module.exports = { recordPayment, getPayments, getCollectionSummary };
