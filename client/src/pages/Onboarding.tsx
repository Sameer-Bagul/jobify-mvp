import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, ArrowLeft, Loader2, Upload, Plus, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    skills: [] as string[],
    experienceYears: 0,
    currentJobTitle: '',
    linkedinUrl: '',
    portfolioUrl: '',
    gmailAppPassword: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'skills') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });
      if (resume) {
        submitData.append('resume', resume);
      }

      await api.post('/users/onboarding', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser({ onboardingCompleted: true });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">Step {step} of 3</p>
          
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-dark-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-dark"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-dark"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-dark"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Job Title</label>
                <input
                  type="text"
                  value={formData.currentJobTitle}
                  onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                  className="input-dark"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Skills & Experience</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="input-dark flex-1"
                    placeholder="Add a skill (e.g., React, Python)"
                  />
                  <button onClick={addSkill} className="btn-secondary p-3">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)}>
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  className="input-dark"
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resume</label>
                <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-400">
                    {resume ? resume.name : 'Click to upload your resume (PDF)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Email & Links</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gmail App Password</label>
                <input
                  type="password"
                  value={formData.gmailAppPassword}
                  onChange={(e) => setFormData({ ...formData, gmailAppPassword: e.target.value })}
                  className="input-dark"
                  placeholder="Enter your Gmail app password"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Required for cold email automation. Create one in your Google Account settings.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="input-dark"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio URL</label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  className="input-dark"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2">
                Next <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Complete Setup <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
