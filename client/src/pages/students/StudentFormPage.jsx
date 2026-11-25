import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentService } from '@/api/studentService';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';

const AddStudentPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ledgerNo: '',
    studentName: '',
    fatherName: '',
    motherName: '',
    enrollmentNo: '',
    admissionNo: '',
    mediumOfAdmission: '',
    course: '',
    batch: '',
    totalFee: '',
    semester: '',
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.enrollmentNo.trim() || !form.studentName.trim()) {
      toast.error('Enrollment No and Student Name are required.');
      return;
    }
    if (form.totalFee && !form.semester) {
      toast.error('Please select a semester for the fee.');
      return;
    }

    setSubmitting(true);
    try {
      await studentService.createStudent({
        ledgerNo: form.ledgerNo,
        studentName: form.studentName,
        fatherName: form.fatherName,
        motherName: form.motherName,
        enrollmentNo: form.enrollmentNo,
        admissionNo: form.admissionNo,
        mediumOfAdmission: form.mediumOfAdmission,
        course: form.course,
        batch: form.batch,
        totalFee: form.totalFee ? Number(form.totalFee) : undefined,
        semester: form.semester || undefined,
      });
      toast.success('Student added successfully!');
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/students')}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Student</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register a new student</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Student Details */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Student Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Enrollment No *</label>
            <input
              name="enrollmentNo"
              value={form.enrollmentNo}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., ENR2026001"
              required
            />
          </div>
          <div>
            <label className="label">Student Name *</label>
            <input
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter student's full name"
              required
            />
          </div>
          <div>
            <label className="label">Father's Name</label>
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              className="input-field"
              placeholder="Father's name"
            />
          </div>
          <div>
            <label className="label">Mother's Name</label>
            <input
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
              className="input-field"
              placeholder="Mother's name"
            />
          </div>
          <div>
            <label className="label">Ledger No</label>
            <input
              name="ledgerNo"
              value={form.ledgerNo}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., LDG001"
            />
          </div>
          <div>
            <label className="label">Admission No</label>
            <input
              name="admissionNo"
              value={form.admissionNo}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., ADM2026001"
            />
          </div>
          <div>
            <label className="label">Medium of Admission</label>
            <input
              name="mediumOfAdmission"
              value={form.mediumOfAdmission}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Hindi, English"
            />
          </div>
          <div>
            <label className="label">Course</label>
            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., B.Tech, BBA"
            />
          </div>
          <div>
            <label className="label">Batch</label>
            <input
              name="batch"
              value={form.batch}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 2026-2030"
            />
          </div>
        </div>

        {/* Fee Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Semester Fee (optional — can add later)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Semester</option>
                <option value="Semester 1 - 2026-2027">Semester 1 - 2026-2027</option>
                <option value="Semester 2 - 2026-2027">Semester 2 - 2026-2027</option>
                <option value="Semester 1 - 2027-2028">Semester 1 - 2027-2028</option>
                <option value="Semester 2 - 2027-2028">Semester 2 - 2027-2028</option>
              </select>
            </div>
            <div>
              <label className="label">Total Fee (₹)</label>
              <input
                name="totalFee"
                type="number"
                min="0"
                value={form.totalFee}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 25000"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={() => navigate('/students')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;
