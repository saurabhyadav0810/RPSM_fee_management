import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '@/api/studentService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { Plus, Search, Users, Eye, Edit } from 'lucide-react';

const StudentsListPage = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({ page, limit: 15, search: search || undefined });
      setStudents(res.data.data.students);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchStudents(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage student records</p>
        </div>
        <Link to="/students/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, enrollment no, admission no, or ledger no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8"><LoadingSpinner size="lg" /></div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Add your first student to get started."
            action={
              <Link to="/students/new" className="btn-primary gap-2">
                <Plus className="h-4 w-4" /> Add Student
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Sr.</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Enrollment No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Student Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Batch</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total Fee</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Paid</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Remaining</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((s, index) => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500">
                      {((pagination?.currentPage || 1) - 1) * (pagination?.perPage || 15) + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.enrollmentNo}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.studentName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.course || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.batch || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      ₹{(s.totalFee || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      ₹{(s.totalPaid || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600">
                      ₹{(s.totalRemaining || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/students/${s._id}`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/students/${s._id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsListPage;
