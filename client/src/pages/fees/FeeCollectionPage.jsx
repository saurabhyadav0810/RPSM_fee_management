import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/api/paymentService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatCard from '@/components/ui/StatCard';
import toast from 'react-hot-toast';
import { Users, IndianRupee, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';

const FeeCollectionPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSemester) params.semester = selectedSemester;
      if (feeStatusFilter) params.feeStatus = feeStatusFilter;
      const res = await paymentService.getCollectionSummary(params);
      setSummary(res.data.data.summary);
      setFees(res.data.data.fees);
      setSemesters(res.data.data.semesters);
    } catch {
      toast.error('Failed to load summary.');
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, feeStatusFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Collection Summary</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of fee collection status</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="input-field w-auto min-w-[200px]"
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Fee Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value)}
              className="input-field pl-10 w-auto min-w-[180px]"
            >
              <option value="">All Status</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Students" value={summary.totalStudents} icon={Users} color="primary" />
          <StatCard
            title="Total Fee"
            value={`₹${summary.totalFeeAmount.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            color="blue"
          />
          <StatCard
            title="Collected"
            value={`₹${summary.totalCollected.toLocaleString('en-IN')}`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending"
            value={`₹${summary.totalPending.toLocaleString('en-IN')}`}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Unpaid Students"
            value={summary.unpaid}
            icon={AlertTriangle}
            color="red"
          />
        </div>
      )}

      {/* Progress Bar */}
      {summary && summary.totalFeeAmount > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Collection Progress
            </span>
            <span className="text-sm font-bold text-primary-600">
              {((summary.totalCollected / summary.totalFeeAmount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (summary.totalCollected / summary.totalFeeAmount) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{summary.fullyPaid} Fully Paid</span>
            <span>{summary.partiallyPaid} Partial</span>
            <span>{summary.unpaid} Unpaid</span>
          </div>
        </div>
      )}

      {/* Student-wise Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Student-wise Fee Status</h3>
          {feeStatusFilter && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              feeStatusFilter === 'Fully Paid' ? 'bg-emerald-100 text-emerald-700' :
              feeStatusFilter === 'Partially Paid' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              <Filter className="h-3 w-3" />
              {feeStatusFilter}
              <button
                onClick={() => setFeeStatusFilter('')}
                className="ml-1 hover:opacity-70"
                title="Clear filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
        {fees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {feeStatusFilter
              ? `No students with "${feeStatusFilter}" status found.`
              : 'No fee records found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Sr.</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Semester</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total Fee</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Paid</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Remaining</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fees.map((f, index) => (
                  <tr key={f._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {f.student?.studentName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{f.student?.enrollmentNo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {f.student?.course || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{f.semester}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      ₹{f.totalFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      ₹{f.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600">
                      ₹{f.remainingFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          f.status === 'Fully Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : f.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeCollectionPage;
