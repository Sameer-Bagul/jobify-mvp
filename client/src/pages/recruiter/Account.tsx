import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Building2, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface RecruiterProfile {
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  industry: string;
  companySize: string;
}

export default function RecruiterAccount() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/recruiters/profile');
        if (res.data) {
          setProfile(res.data);
        } else {
          setProfile({
            companyName: '',
            companyWebsite: '',
            companyDescription: '',
            industry: '',
            companySize: '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfile({
          companyName: '',
          companyWebsite: '',
          companyDescription: '',
          industry: '',
          companySize: '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await api.put('/recruiters/profile', profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout role="recruiter">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="recruiter">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Profile updated successfully!
            </div>
          )}

          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{profile?.companyName || 'Company Name'}</h2>
              <p className="text-gray-400">{profile?.industry || 'Industry'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
            <input
              type="text"
              value={profile?.companyName || ''}
              onChange={(e) => setProfile({ ...profile!, companyName: e.target.value })}
              className="input-dark"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company Website</label>
            <input
              type="url"
              value={profile?.companyWebsite || ''}
              onChange={(e) => setProfile({ ...profile!, companyWebsite: e.target.value })}
              className="input-dark"
              placeholder="https://company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company Description</label>
            <textarea
              value={profile?.companyDescription || ''}
              onChange={(e) => setProfile({ ...profile!, companyDescription: e.target.value })}
              className="input-dark h-24 resize-none"
              placeholder="Tell candidates about your company..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <input
                type="text"
                value={profile?.industry || ''}
                onChange={(e) => setProfile({ ...profile!, industry: e.target.value })}
                className="input-dark"
                placeholder="Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
              <select
                value={profile?.companySize || ''}
                onChange={(e) => setProfile({ ...profile!, companySize: e.target.value })}
                className="input-dark"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
