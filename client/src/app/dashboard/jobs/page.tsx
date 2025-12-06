'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building, DollarSign } from 'lucide-react';
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
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
        <input
          type="text"
          placeholder="Search jobs, companies, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.companyName || 'Unknown Company'}
                      </span>
                      {job.location && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                  {job.description || 'No description provided'}
                </p>

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No jobs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
