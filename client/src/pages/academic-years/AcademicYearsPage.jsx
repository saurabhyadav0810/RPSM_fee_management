import { useState, useEffect, useCallback } from 'react';
import { academicYearService } from '@/api/academicYearService';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Plus,
  Calendar,
  Edit,
  Trash2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

const AcademicYearsPage = () => {
  const { isMainAdmin } = useAuth();
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: true,
    semesters: [{ name: 'Semester 1', startDate: '', endDate: '' }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await academicYearService.getAll();
      setAcademicYears(res.data.data.academicYears);
    } catch {
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isActive: true,
      semesters: [{ name: 'Semester 1', startDate: '', endDate: '' }],
    });
    setModalOpen(true);
  };

  const openEdit = (ay) => {
    setEditItem(ay);
    setFormData({
      name: ay.name,
      startDate: ay.startDate ? new Date(ay.startDate).toISOString().split('T')[0] : '',
      endDate: ay.endDate ? new Date(ay.endDate).toISOString().split('T')[0] : '',
      isActive: ay.isActive,
      semesters: ay.semesters.map((s) => ({
        name: s.name,
        startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '',
        endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '',
      })),
    });
    setModalOpen(true);
  };

  const addSemester = () => {
    setFormData((prev) => ({
      ...prev,
      semesters: [
        ...prev.semesters,
        { name: `Semester ${prev.semesters.length + 1}`, startDate: '', endDate: '' },
      ],
    }));
  };

  const removeSemester = (idx) => {
    if (formData.semesters.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      semesters: prev.semesters.filter((_, i) => i !== idx),
    }));
  };

  const updateSemester = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.semesters.some((s) => !s.name)) {
      toast.error('All semesters must have a name.');
      return;
    }

    setSubmitting(true);
    try {
      if (editItem) {
        await academicYearService.update(editItem._id, formData);
        toast.success('Academic year updated successfully!');
      } else {
        await academicYearService.create(formData);
        toast.success('Academic year created successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await academicYearService.delete(id);
      toast.success('Academic year deactivated.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Years</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage academic years and semester configurations
          </p>
        </div>
        {isMainAdmin && (
          <button onClick={openCreate} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add Academic Year
          </button>
        )}
      </div>

      {/* List */}
      {academicYears.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No academic years configured"
          description="Configure your first academic year to get started."
          action={
            isMainAdmin && (
              <button onClick={openCreate} className="btn-primary gap-2">
                <Plus className="h-4 w-4" />
                Add Academic Year
              </button>
            )
          }
        />
      ) : (
        <div className="grid gap-4">
          {academicYears.map((ay) => (
            <div key={ay._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{ay.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ay.startDate && format(new Date(ay.startDate), 'dd MMM yyyy')} —{' '}
                        {ay.endDate && format(new Date(ay.endDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <Badge variant={ay.isActive ? 'success' : 'default'}>
                      {ay.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Semesters */}
                  <div className="mt-3 ml-11 flex flex-wrap gap-2">
                    {ay.semesters.map((sem) => (
                      <div
                        key={sem._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                      >
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{sem.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isMainAdmin && (
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => openEdit(ay)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {ay.isActive && (
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: ay._id })}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Deactivate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Academic Year' : 'Create Academic Year'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g., 2026-2027"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          {/* Semesters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Semesters *</label>
              <button
                type="button"
                onClick={addSemester}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Semester
              </button>
            </div>
            <div className="space-y-3">
              {formData.semesters.map((sem, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      value={sem.name}
                      onChange={(e) => updateSemester(idx, 'name', e.target.value)}
                      placeholder="Semester name"
                      className="input-field text-sm"
                      required
                    />
                    <input
                      type="date"
                      value={sem.startDate}
                      onChange={(e) => updateSemester(idx, 'startDate', e.target.value)}
                      className="input-field text-sm"
                    />
                    <input
                      type="date"
                      value={sem.endDate}
                      onChange={(e) => updateSemester(idx, 'endDate', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  {formData.semesters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSemester(idx)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Deactivate Academic Year"
        message="Are you sure you want to deactivate this academic year? It will no longer appear in active selections."
        confirmText="Deactivate"
      />
    </div>
  );
};

export default AcademicYearsPage;
