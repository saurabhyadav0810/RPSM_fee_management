import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentService } from '@/api/studentService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, User, Hash, BookOpen, GraduationCap, Users } from 'lucide-react';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await studentService.getStudent(id);
        setStudent(res.data.data.student);
        setFees(res.data.data.fees || []);
      } catch {
        toast.error('Failed to load student.');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (!student) return null;

  const infoFields = [
    { icon: Hash, label: 'Enrollment No', value: student.enrollmentNo },
    { icon: Hash, label: 'Admission No', value: student.admissionNo || 'N/A' },
    { icon: Hash, label: 'Ledger No', value: student.ledgerNo || 'N/A' },
    { icon: User, label: "Father's Name", value: student.fatherName || 'N/A' },
    { icon: Users, label: "Mother's Name", value: student.motherName || 'N/A' },
    { icon: BookOpen, label: 'Medium', value: student.mediumOfAdmission || 'N/A' },
    { icon: GraduationCap, label: 'Course', value: student.course || 'N/A' },
    { icon: Hash, label: 'Batch', value: student.batch || 'N/A' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/students')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
        </div>
        <Link to={`/students/${id}/edit`} className="btn-primary gap-2">
          <Edit className="h-4 w-4" /> Edit
        </Link>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">{student.studentName.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.studentName}</h2>
            <p className="text-sm text-gray-500">
              {student.enrollmentNo}
              {student.course ? ` • ${student.course}` : ''}
              {student.batch ? ` • ${student.batch}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {infoFields.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fees */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
          Semester-wise Fees
        </h3>
        {fees.length === 0 ? (
          <p className="text-sm text-gray-500">No fee records yet. <Link to={`/students/${id}/edit`} className="text-primary-600 hover:underline">Add fees</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Semester</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Total Fee</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Paid</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Remaining</th>
                  <th className="px-4 py-2 text-center text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fees.map((f) => (
                  <tr key={f._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{f.semester}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{f.totalFee.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹{f.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">₹{f.remainingFee.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.status === 'Fully Paid' ? 'bg-emerald-100 text-emerald-700' :
                        f.status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
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

export default StudentProfilePage;
