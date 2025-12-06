'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  isActive: boolean;
  createdAt: string;
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await api.delete(`/recruiters/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleToggleStatus = async (jobId: number, currentStatus: boolean) => {
    try {
      await api.put(`/recruiters/jobs/${jobId}`, { isActive: !currentStatus });
      setJobs(
        jobs.map((job) =>
          job.id === jobId ? { ...job, isActive: !currentStatus } : job
        )
      );
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link
          href="/dashboard/recruiter/post-job"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Job
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/dashboard/recruiter/candidates?jobId=${job.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(job.id, job.isActive)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        job.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
          <Link
            href="/dashboard/recruiter/post-job"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post Your First Job
          </Link>
        </div>
      )}
    </div>
  );
}
