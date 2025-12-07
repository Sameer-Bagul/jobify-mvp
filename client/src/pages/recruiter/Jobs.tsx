import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { MapPin, DollarSign, Clock, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  requiredSkills: string[];
  jobType: string;
  isActive: boolean;
  createdAt: string;
}

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/recruiters/jobs');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (jobId: string, isActive: boolean) => {
    try {
      await api.put(`/recruiters/jobs/${jobId}`, { isActive: !isActive });
      fetchJobs();
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/recruiters/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Jobs</h1>
            <p className="text-gray-400">Manage your job postings</p>
          </div>
          <Link to="/dashboard/recruiter/post-job" className="btn-primary">
            Post New Job
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 mb-4">No jobs posted yet</p>
            <Link to="/dashboard/recruiter/post-job" className="btn-primary inline-flex">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          job.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{job.company}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.jobType}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(job._id, job.isActive)}
                      className="p-2 rounded-lg hover:bg-dark-600 transition-colors"
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {job.isActive ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <Link
                      to={`/dashboard/recruiter/post-job?edit=${job._id}`}
                      className="p-2 rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      <Edit className="h-5 w-5 text-gray-400" />
                    </Link>
                    <button
                      onClick={() => deleteJob(job._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
