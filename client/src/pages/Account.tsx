import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { User, Loader2, CheckCircle, X, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Profile {
  fullName: string;
  phone: string;
  location: string;
  skills: string[];
  experienceYears: number;
  currentJobTitle: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export default function Account() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        if (res.data.profile) {
          setProfile(res.data.profile);
        } else {
          setProfile({
            fullName: '',
            phone: '',
            location: '',
            skills: [],
            experienceYears: 0,
            currentJobTitle: '',
            linkedinUrl: '',
            portfolioUrl: '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const addSkill = () => {
    if (profile && skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    if (profile) {
      setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await api.put('/users/profile', profile);
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
      <Layout role="seeker">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="seeker">
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
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{profile?.fullName || 'Your Name'}</h2>
              <p className="text-gray-400">{profile?.currentJobTitle || 'Job Title'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profile?.fullName || ''}
                onChange={(e) => setProfile({ ...profile!, fullName: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={profile?.phone || ''}
                onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                className="input-dark"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={profile?.location || ''}
                onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Job Title</label>
              <input
                type="text"
                value={profile?.currentJobTitle || ''}
                onChange={(e) => setProfile({ ...profile!, currentJobTitle: e.target.value })}
                className="input-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-dark flex-1"
                placeholder="Add a skill"
              />
              <button type="button" onClick={addSkill} className="btn-secondary p-3">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={profile?.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile!, linkedinUrl: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio URL</label>
              <input
                type="url"
                value={profile?.portfolioUrl || ''}
                onChange={(e) => setProfile({ ...profile!, portfolioUrl: e.target.value })}
                className="input-dark"
              />
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
