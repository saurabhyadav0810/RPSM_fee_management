import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentService } from '@/api/studentService';
import { ArrowLeft, Loader2, Save, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    ledgerNo: '',
    admissionNo: '',
    mediumOfAdmission: '',
    course: '',
    batch: '',
    status: 'Active',
  });
  const [fees, setFees] = useState([]);
  const [newFee, setNewFee] = useState({ semester: '', totalFee: '' });
  const [editFee, setEditFee] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await studentService.getStudent(id);
        const { student, fees: studentFees } = res.data.data;
        setForm({
          studentName: student.studentName || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          ledgerNo: student.ledgerNo || '',
          admissionNo: student.admissionNo || '',
          mediumOfAdmission: student.mediumOfAdmission || '',
          course: student.course || '',
          batch: student.batch || '',
          status: student.status,
        });
        setFees(studentFees || []);
      } catch (err) {
        toast.error('Failed to load student.');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!form.studentName.trim()) {
      toast.error('Student name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await studentService.updateStudent(id, form);
      toast.success('Student details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFee = async (semester, totalFee) => {
    try {
      await studentService.updateStudent(id, { semester, totalFee: Number(totalFee) });
      toast.success(`Fee updated for ${semester}`);
      const res = await studentService.getStudent(id);
      setFees(res.data.data.fees || []);
      setEditFee(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fee.');
    }
  };

  const handleAddFee = async () => {
    if (!newFee.semester || !newFee.totalFee) {
      toast.error('Select semester and enter fee amount.');
      return;
    }
    try {
      await studentService.updateStudent(id, {
        semester: newFee.semester,
        totalFee: Number(newFee.totalFee),
      });
      toast.success('Fee record added!');
      const res = await studentService.getStudent(id);
      setFees(res.data.data.fees || []);
      setNewFee({ semester: '', totalFee: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add fee.');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/students')}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Student</h1>
      </div>

      {/* Student Details Form */}
      <form onSubmit={handleSaveDetails} className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Student Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Student Name *</label>
            <input name="studentName" value={form.studentName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="label">Father's Name</label>
            <input name="fatherName" value={form.fatherName} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Mother's Name</label>
            <input name="motherName" value={form.motherName} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Ledger No</label>
            <input name="ledgerNo" value={form.ledgerNo} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Admission No</label>
            <input name="admissionNo" value={form.admissionNo} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Medium of Admission</label>
            <input name="mediumOfAdmission" value={form.mediumOfAdmission} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Course</label>
            <input name="course" value={form.course} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Batch</label>
            <input name="batch" value={form.batch} onChange={handleChange} className="input-field" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={submitting} className="btn-primary gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Details
          </button>
        </div>
      </form>

      {/* Semester Fees */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Semester Fees
        </h3>

        {fees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Semester</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Total Fee</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Paid</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Remaining</th>
                  <th className="px-4 py-2 text-center text-gray-500 font-medium">Status</th>
                  <th className="px-4 py-2 text-center text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fees.map((fee) => (
                  <tr key={fee._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{fee.semester}</td>
                    <td className="px-4 py-3 text-right">
                      {editFee?.semester === fee.semester ? (
                        <input
                          type="number"
                          className="input-field w-28 text-right text-sm"
                          value={editFee.totalFee}
                          onChange={(e) => setEditFee({ ...editFee, totalFee: e.target.value })}
                          min="0"
                        />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">
                          ₹{fee.totalFee.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      ₹{fee.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">
                      ₹{fee.remainingFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          fee.status === 'Fully Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : fee.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editFee?.semester === fee.semester ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUpdateFee(fee.semester, editFee.totalFee)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditFee(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditFee({ semester: fee.semester, totalFee: fee.totalFee })}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit Fee
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No fee records yet.</p>
        )}

        {/* Add New Fee */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Semester Fee</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newFee.semester}
              onChange={(e) => setNewFee((f) => ({ ...f, semester: e.target.value }))}
              className="input-field flex-1"
            >
              <option value="">Select Semester</option>
              <option value="Semester 1 - 2026-2027">Semester 1 - 2026-2027</option>
              <option value="Semester 2 - 2026-2027">Semester 2 - 2026-2027</option>
              <option value="Semester 1 - 2027-2028">Semester 1 - 2027-2028</option>
              <option value="Semester 2 - 2027-2028">Semester 2 - 2027-2028</option>
            </select>
            <input
              type="number"
              min="0"
              value={newFee.totalFee}
              onChange={(e) => setNewFee((f) => ({ ...f, totalFee: e.target.value }))}
              className="input-field w-40"
              placeholder="Total Fee ₹"
            />
            <button type="button" onClick={handleAddFee} className="btn-primary gap-2">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentPage;
