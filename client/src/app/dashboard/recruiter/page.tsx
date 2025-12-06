'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  id: number;
  title: string;
  isActive: boolean;
  createdAt: string;
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/recruiters/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeJobs = jobs.filter((job) => job.isActive).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Recruiter Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Briefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Jobs</h2>
          <Link href="/dashboard/recruiter/jobs" className="text-indigo-600 hover:text-indigo-500 text-sm">
            View all
          </Link>
        </div>
        <div className="divide-y">
          {jobs.length > 0 ? (
            jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    job.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No jobs posted yet.{' '}
              <Link href="/dashboard/recruiter/post-job" className="text-indigo-600 hover:text-indigo-500">
                Post your first job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
