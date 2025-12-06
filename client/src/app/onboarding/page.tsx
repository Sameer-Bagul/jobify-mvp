'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import api from '@/lib/api';

const steps = ['Basic Info', 'Gmail Setup', 'Skills', 'Resume', 'Confirmation'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    gmailId: '',
    gmailAppPassword: '',
    skills: [] as string[],
    experience: '',
    resume: null as File | null,
  });
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('gmailId', formData.gmailId);
      data.append('gmailAppPassword', formData.gmailAppPassword);
      data.append('skills', JSON.stringify(formData.skills));
      data.append('experience', formData.experience);
      if (formData.resume) {
        data.append('resume', formData.resume);
      }

      await api.post('/users/onboarding', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gmail Address
              </label>
              <input
                type="email"
                name="gmailId"
                value={formData.gmailId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your.email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gmail App Password
              </label>
              <input
                type="password"
                name="gmailAppPassword"
                value={formData.gmailAppPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your app password"
              />
              <p className="mt-1 text-sm text-gray-500">
                You can generate an App Password from your Google Account security settings.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
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
                {formData.skills.map((skill, index) => (
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
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your work experience..."
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {formData.resume ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-500" />
                      <span className="ml-2 text-gray-600">{formData.resume.name}</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">You are all set!</h3>
            <p className="text-gray-500">
              Click Complete to finish onboarding and start using JobSeeker Pro.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to JobSeeker Pro</h1>
          <p className="mt-2 text-gray-600">Let us set up your profile in a few easy steps.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span
                key={step}
                className={`text-xs ${
                  index <= currentStep ? 'text-indigo-600' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
              {error}
            </div>
          )}

          {renderStep()}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Complete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
