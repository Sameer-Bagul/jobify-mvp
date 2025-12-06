'use client';

import { useEffect, useState } from 'react';
import { Save, Upload } from 'lucide-react';
import api from '@/lib/api';

interface Profile {
  name: string;
  skills: string[];
  experience: string;
  gmailId: string;
  gmailAppPassword: string;
  resumeUrl: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    skills: [],
    experience: '',
    gmailId: '',
    gmailAppPassword: '',
    resumeUrl: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data.profile) {
          setProfile({
            name: response.data.profile.name || '',
            skills: response.data.profile.skills || [],
            experience: response.data.profile.experience || '',
            gmailId: response.data.profile.gmailId || '',
            gmailAppPassword: '',
            resumeUrl: response.data.profile.resumeUrl || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('skills', JSON.stringify(profile.skills));
      formData.append('experience', profile.experience);
      formData.append('gmailId', profile.gmailId);
      if (profile.gmailAppPassword) {
        formData.append('gmailAppPassword', profile.gmailAppPassword);
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <textarea
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your work experience..."
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gmail Settings (for Cold Emails)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gmail Address
                </label>
                <input
                  type="email"
                  value={profile.gmailId}
                  onChange={(e) => setProfile({ ...profile, gmailId: e.target.value })}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gmail App Password
                </label>
                <input
                  type="password"
                  value={profile.gmailAppPassword}
                  onChange={(e) => setProfile({ ...profile, gmailAppPassword: e.target.value })}
                  placeholder="Enter your Gmail App Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Generate an App Password from your Google Account security settings.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume (PDF)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <Upload className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {resumeFile ? resumeFile.name : 'Choose file'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  View current resume
                </a>
              )}
            </div>
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
