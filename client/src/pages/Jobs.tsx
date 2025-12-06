import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { MapPin, DollarSign, Clock, Search } from 'lucide-react';
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
  createdAt: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout role="seeker">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
          <p className="text-gray-400">Find opportunities that match your skills</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-12 w-full"
              placeholder="Search by title, company, or skill..."
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No jobs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link
                key={job._id}
                to={`/dashboard/jobs/${job._id}`}
                className="card block hover:border-purple-500/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
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
                      {job.requiredSkills.length > 5 && (
                        <span className="px-3 py-1 bg-dark-600 text-gray-400 rounded-full text-sm">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
