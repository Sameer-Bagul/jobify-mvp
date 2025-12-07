import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Users, Search, Plus, Trash2, Edit, Loader2, Mail, Building, X } from 'lucide-react';
import api from '@/lib/api';

interface Recruiter {
  _id: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
}

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      const res = await api.get('/admin/recruiters');
      setRecruiters(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch recruiters:', err);
      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingRecruiter) {
        await api.put(`/admin/recruiters/${editingRecruiter._id}`, formData);
        setRecruiters(recruiters.map(r => 
          r._id === editingRecruiter._id ? { ...r, ...formData } : r
        ));
      } else {
        const res = await api.post('/admin/recruiters', formData);
        setRecruiters([...recruiters, res.data]);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save recruiter:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recruiter?')) return;
    
    setDeleteLoading(id);
    try {
      await api.delete(`/admin/recruiters/${id}`);
      setRecruiters(recruiters.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete recruiter:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const openModal = (recruiter?: Recruiter) => {
    if (recruiter) {
      setEditingRecruiter(recruiter);
      setFormData({ name: recruiter.name, email: recruiter.email, company: recruiter.company });
    } else {
      setEditingRecruiter(null);
      setFormData({ name: '', email: '', company: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecruiter(null);
    setFormData({ name: '', email: '', company: '' });
  };

  const filteredRecruiters = Array.isArray(recruiters) ? recruiters.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.company?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Internal Recruiters</h1>
            <p className="text-gray-400">Manage internal recruiter contacts</p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Recruiter
          </button>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search recruiters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-12 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecruiters.map((recruiter) => (
              <div key={recruiter._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(recruiter)}
                      className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(recruiter._id)}
                      disabled={deleteLoading === recruiter._id}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
                    >
                      {deleteLoading === recruiter._id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{recruiter.name}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {recruiter.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {recruiter.company}
                  </p>
                </div>
              </div>
            ))}

            {filteredRecruiters.length === 0 && (
              <div className="col-span-full card text-center py-12">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No recruiters found</p>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingRecruiter ? 'Edit Recruiter' : 'Add Recruiter'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-dark w-full"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-dark w-full"
                    placeholder="recruiter@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="input-dark w-full"
                    placeholder="Company Inc."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    editingRecruiter ? 'Update Recruiter' : 'Add Recruiter'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
