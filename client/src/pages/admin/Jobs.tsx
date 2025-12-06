import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Briefcase, Search, Trash2, Eye, Loader2, Building, MapPin, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface JobData {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  applications?: number;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/admin/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setDeleteLoading(jobId);
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      console.error('Failed to delete job:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Jobs</h1>
            <p className="text-gray-400">Manage job listings</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Briefcase className="h-5 w-5" />
            <span>{jobs.length} total jobs</span>
          </div>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-12 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div key={job._id} className="card hover:border-purple-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                      <p className="text-gray-400 mb-2">{job.company}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          job.status === 'active' 
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/dashboard/jobs/${job._id}`}
                      className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    >
                      <Eye className="h-5 w-5 text-gray-400" />
                    </a>
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deleteLoading === job._id}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
                    >
                      {deleteLoading === job._id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="h-5 w-5 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="card text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No jobs found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
