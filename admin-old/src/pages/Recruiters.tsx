import { useEffect, useState, useRef } from 'react';
import { Plus, Upload, Search, Pencil, Trash2, X } from 'lucide-react';
import {
  getRecruiters,
  addRecruiter,
  updateRecruiter,
  deleteRecruiter,
  uploadRecruitersCSV,
  Recruiter,
  RecruiterInput,
} from '../lib/services/recruiters';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [deletingRecruiter, setDeletingRecruiter] = useState<Recruiter | null>(null);
  const [formData, setFormData] = useState<RecruiterInput>({
    recruiterName: '',
    recruiterEmail: '',
    companyName: '',
    linkedinUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecruiters = async () => {
    try {
      const data = await getRecruiters();
      setRecruiters(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const showMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  const openAddModal = () => {
    setEditingRecruiter(null);
    setFormData({
      recruiterName: '',
      recruiterEmail: '',
      companyName: '',
      linkedinUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setFormData({
      recruiterName: recruiter.recruiterName || '',
      recruiterEmail: recruiter.recruiterEmail,
      companyName: recruiter.companyName || '',
      linkedinUrl: recruiter.linkedinUrl || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (recruiter: Recruiter) => {
    setDeletingRecruiter(recruiter);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingRecruiter) {
        await updateRecruiter(editingRecruiter._id, formData);
        showMessage('success', 'Recruiter updated successfully');
      } else {
        await addRecruiter(formData);
        showMessage('success', 'Recruiter added successfully');
      }
      setIsModalOpen(false);
      fetchRecruiters();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showMessage('error', error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecruiter) return;
    setSubmitting(true);

    try {
      await deleteRecruiter(deletingRecruiter._id);
      showMessage('success', 'Recruiter deleted successfully');
      setIsDeleteModalOpen(false);
      fetchRecruiters();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showMessage('error', error.response?.data?.error || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    try {
      const result = await uploadRecruitersCSV(file);
      showMessage('success', result.message);
      fetchRecruiters();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showMessage('error', error.response?.data?.error || 'Upload failed');
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredRecruiters = recruiters.filter((r) => {
    const searchLower = search.toLowerCase();
    return (
      r.recruiterName?.toLowerCase().includes(searchLower) ||
      r.recruiterEmail.toLowerCase().includes(searchLower) ||
      r.companyName?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            error
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-green-500/10 border border-green-500/30 text-green-400'
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recruiters..."
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
          />
        </div>

        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-500 text-white rounded-lg hover:bg-dark-600 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recruiter</span>
          </button>
        </div>
      </div>

      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Company</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No recruiters found
                  </td>
                </tr>
              ) : (
                filteredRecruiters.map((recruiter) => (
                  <tr key={recruiter._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="px-6 py-4 text-white">
                      {recruiter.recruiterName || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{recruiter.recruiterEmail}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {recruiter.companyName || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(recruiter)}
                          className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(recruiter)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecruiter ? 'Edit Recruiter' : 'Add Recruiter'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.recruiterName}
              onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-accent-purple"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.recruiterEmail}
              onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-accent-purple"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-accent-purple"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn URL (optional)</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-accent-purple"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingRecruiter ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Recruiter"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">
            {deletingRecruiter?.recruiterName || deletingRecruiter?.recruiterEmail}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
