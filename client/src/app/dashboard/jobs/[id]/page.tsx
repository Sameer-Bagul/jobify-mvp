'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Building, DollarSign, ArrowLeft, Mail } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  salary: string;
  companyName: string;
  recruiterName: string;
  recruiterEmail: string;
  createdAt: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${params.id}`);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const handleSendEmail = async () => {
    if (!job) return;

    setSending(true);
    setMessage(null);

    try {
      const response = await api.post('/email/send', { jobId: job.id });
      setMessage({ type: 'success', text: response.data.message });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to send email' 
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Job not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Jobs
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-500">
            <span className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              {job.companyName || 'Unknown Company'}
            </span>
            {job.location && (
              <span className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {job.salary}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {job.description || 'No description provided'}
            </p>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              <p className="text-sm text-gray-500">Contact Recruiter</p>
              <p className="font-medium text-gray-900">
                {job.recruiterName || 'Unknown'} ({job.recruiterEmail})
              </p>
            </div>
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Mail className="h-5 w-5 mr-2" />
              {sending ? 'Sending...' : 'Send Cold Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
