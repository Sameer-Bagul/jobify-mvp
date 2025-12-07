import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, ArrowLeft, Loader2, Upload, Plus, X, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const isRecruiter = user?.role === 'recruiter';

  const [seekerData, setSeekerData] = useState({
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

  const [recruiterData, setRecruiterData] = useState({
    companyName: '',
    recruiterName: '',
    phone: '',
    linkedinUrl: '',
    industry: '',
    location: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  const addSkill = () => {
    if (skillInput.trim() && !seekerData.skills.includes(skillInput.trim())) {
      setSeekerData({ ...seekerData, skills: [...seekerData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSeekerData({ ...seekerData, skills: seekerData.skills.filter(s => s !== skill) });
  };

  const handleSeekerSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.entries(seekerData).forEach(([key, value]) => {
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

  const handleRecruiterSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/recruiters/onboarding', recruiterData);
      updateUser({ onboardingCompleted: true });
      navigate('/dashboard/recruiter');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isRecruiter ? handleRecruiterSubmit : handleSeekerSubmit;
  const totalSteps = isRecruiter ? 2 : 3;

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            {isRecruiter ? <Building2 className="h-8 w-8 text-white" /> : <Briefcase className="h-8 w-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isRecruiter ? 'Set Up Your Recruiter Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-gray-400">Step {step} of {totalSteps}</p>
          
          <div className="flex gap-2 justify-center mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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

          {isRecruiter ? (
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Company Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={recruiterData.companyName}
                      onChange={(e) => setRecruiterData({ ...recruiterData, companyName: e.target.value })}
                      className="input-dark"
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={recruiterData.recruiterName}
                      onChange={(e) => setRecruiterData({ ...recruiterData, recruiterName: e.target.value })}
                      className="input-dark"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                    <select
                      value={recruiterData.industry}
                      onChange={(e) => setRecruiterData({ ...recruiterData, industry: e.target.value })}
                      className="input-dark"
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Contact Details</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={recruiterData.phone}
                      onChange={(e) => setRecruiterData({ ...recruiterData, phone: e.target.value })}
                      className="input-dark"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={recruiterData.location}
                      onChange={(e) => setRecruiterData({ ...recruiterData, location: e.target.value })}
                      className="input-dark"
                      placeholder="Mumbai, India"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={recruiterData.linkedinUrl}
                      onChange={(e) => setRecruiterData({ ...recruiterData, linkedinUrl: e.target.value })}
                      className="input-dark"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={seekerData.fullName}
                      onChange={(e) => setSeekerData({ ...seekerData, fullName: e.target.value })}
                      className="input-dark"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={seekerData.phone}
                        onChange={(e) => setSeekerData({ ...seekerData, phone: e.target.value })}
                        className="input-dark"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={seekerData.location}
                        onChange={(e) => setSeekerData({ ...seekerData, location: e.target.value })}
                        className="input-dark"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Job Title</label>
                    <input
                      type="text"
                      value={seekerData.currentJobTitle}
                      onChange={(e) => setSeekerData({ ...seekerData, currentJobTitle: e.target.value })}
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
                      {seekerData.skills.map((skill) => (
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
                      value={seekerData.experienceYears}
                      onChange={(e) => setSeekerData({ ...seekerData, experienceYears: parseInt(e.target.value) || 0 })}
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
                      value={seekerData.gmailAppPassword}
                      onChange={(e) => setSeekerData({ ...seekerData, gmailAppPassword: e.target.value })}
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
                      value={seekerData.linkedinUrl}
                      onChange={(e) => setSeekerData({ ...seekerData, linkedinUrl: e.target.value })}
                      className="input-dark"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio URL</label>
                    <input
                      type="url"
                      value={seekerData.portfolioUrl}
                      onChange={(e) => setSeekerData({ ...seekerData, portfolioUrl: e.target.value })}
                      className="input-dark"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2">
                Next <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || (isRecruiter && (!recruiterData.companyName || !recruiterData.recruiterName))}
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
