import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { MapPin, DollarSign, Clock, ArrowLeft, Briefcase } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  requiredSkills: string[];
  jobType: string;
  experienceLevel: string;
  recruiterEmail: string;
  createdAt: string;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error('Failed to fetch job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">Job not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Jobs
        </button>

        <div className="card mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
              <p className="text-gray-400 text-lg">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-6 text-gray-400">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {job.location}
            </span>
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {job.jobType}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {job.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Apply via Cold Email</h3>
          <p className="text-gray-400 mb-4">
            Send a personalized email to the recruiter to express your interest.
          </p>
          <a
            href={`/dashboard/email?to=${encodeURIComponent(job.recruiterEmail)}&job=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`}
            className="btn-primary inline-flex items-center gap-2"
          >
            Send Email
          </a>
        </div>
      </div>
    </Layout>
  );
}
