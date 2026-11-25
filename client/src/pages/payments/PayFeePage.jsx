import { useState } from 'react';
import { studentService } from '@/api/studentService';
import { paymentService } from '@/api/paymentService';
import toast from 'react-hot-toast';
import { Search, IndianRupee, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PayFeePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({ semester: '', amount: '', paymentMode: 'Cash', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await studentService.searchStudents(searchQuery);
      setSearchResults(res.data.data.students);
      if (res.data.data.students.length === 0) {
        toast.error('No students found.');
      }
    } catch {
      toast.error('Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery('');
    setReceipt(null);
    try {
      const res = await studentService.getStudent(student._id);
      setFees(res.data.data.fees || []);
    } catch {
      toast.error('Failed to load student fees.');
    }
  };

  const handleSemesterChange = (semester) => {
    setForm((f) => ({ ...f, semester }));
    const fee = fees.find((f) => f.semester === semester);
    setSelectedFee(fee || null);
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !form.semester || !form.amount) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const amount = Number(form.amount);
    if (amount <= 0) {
      toast.error('Amount must be greater than ₹0.');
      return;
    }

    if (selectedFee && amount > selectedFee.remainingFee) {
      toast.error(`Amount exceeds remaining fee of ₹${selectedFee.remainingFee.toLocaleString('en-IN')}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await paymentService.recordPayment({
        enrollmentNo: selectedStudent.enrollmentNo,
        semester: form.semester,
        amount,
        paymentMode: form.paymentMode,
        remarks: form.remarks,
      });

      toast.success('Payment recorded successfully!');
      setReceipt(res.data.data);

      // Refresh fees
      const stuRes = await studentService.getStudent(selectedStudent._id);
      setFees(stuRes.data.data.fees || []);

      // Update selected fee
      const updatedFee = stuRes.data.data.fees?.find((f) => f.semester === form.semester);
      setSelectedFee(updatedFee || null);

      setForm((f) => ({ ...f, amount: '', remarks: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setSelectedStudent(null);
    setFees([]);
    setForm({ semester: '', amount: '', paymentMode: 'Cash', remarks: '' });
    setSelectedFee(null);
    setReceipt(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Fee</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record an offline fee payment</p>
      </div>

      {/* Search Student */}
      {!selectedStudent ? (
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Find Student
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10"
                placeholder="Search by name, enrollment no, or admission no..."
              />
            </div>
            <button onClick={handleSearch} disabled={searching} className="btn-primary gap-2">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((s) => (
                <button
                  key={s._id}
                  onClick={() => selectStudent(s)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{s.studentName}</p>
                    <p className="text-xs text-gray-500">
                      {s.enrollmentNo}
                      {s.course ? ` • ${s.course}` : ''}
                      {s.batch ? ` • ${s.batch}` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-primary-600">Select →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Selected Student Info */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-700">{selectedStudent.studentName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedStudent.studentName}</p>
                  <p className="text-xs text-gray-500">{selectedStudent.enrollmentNo}</p>
                </div>
              </div>
              <button onClick={resetAll} className="text-sm text-gray-500 hover:text-gray-700">
                Change Student
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePay} className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Payment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Semester *</label>
                <select
                  value={form.semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Semester</option>
                  {fees.map((f) => (
                    <option key={f._id} value={f.semester}>{f.semester}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Payment Mode</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
                  className="input-field"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Fee Info */}
            {selectedFee && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    ₹{selectedFee.totalFee.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-sm font-bold text-emerald-600">
                    ₹{selectedFee.paidAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="text-sm font-bold text-amber-600">
                    ₹{selectedFee.remainingFee.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="label">Amount to Pay (₹) *</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max={selectedFee?.remainingFee || undefined}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="input-field pl-10 text-lg font-medium"
                  placeholder="Enter amount"
                  required
                />
              </div>
              {selectedFee && form.amount && Number(form.amount) > selectedFee.remainingFee && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Amount exceeds remaining fee of ₹{selectedFee.remainingFee.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <div>
              <label className="label">Remarks (optional)</label>
              <input
                value={form.remarks}
                onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                className="input-field"
                placeholder="Any notes..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !form.semester || !form.amount}
              className="btn-primary w-full py-3 text-base gap-2"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <IndianRupee className="h-5 w-5" />}
              Pay ₹{form.amount ? Number(form.amount).toLocaleString('en-IN') : '0'}
            </button>
          </form>

          {/* Receipt */}
          {receipt && (
            <div className="card p-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Payment Successful</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">Receipt No:</p>
                <p className="font-medium text-gray-900 dark:text-white">{receipt.payment.receiptNumber}</p>
                <p className="text-gray-600 dark:text-gray-400">Amount Paid:</p>
                <p className="font-medium text-emerald-700">₹{receipt.payment.amount.toLocaleString('en-IN')}</p>
                <p className="text-gray-600 dark:text-gray-400">New Balance:</p>
                <p className="font-medium text-gray-900 dark:text-white">₹{receipt.updatedFee.remainingFee.toLocaleString('en-IN')}</p>
                <p className="text-gray-600 dark:text-gray-400">Status:</p>
                <p className="font-medium">{receipt.updatedFee.status}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayFeePage;
