'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import api from '@/lib/api';

interface RecruiterProfile {
  companyName: string;
  recruiterName: string;
  recruiterEmail: string;
}

export default function RecruiterAccountPage() {
  const [profile, setProfile] = useState<RecruiterProfile>({
    companyName: '',
    recruiterName: '',
    recruiterEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/recruiters/profile');
        setProfile({
          companyName: response.data.companyName || '',
          recruiterName: response.data.recruiterName || '',
          recruiterEmail: response.data.recruiterEmail || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.put('/recruiters/profile', profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={profile.recruiterName}
              onChange={(e) => setProfile({ ...profile, recruiterName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={profile.recruiterEmail}
              onChange={(e) => setProfile({ ...profile, recruiterEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              This email will be used by job seekers to contact you.
            </p>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
