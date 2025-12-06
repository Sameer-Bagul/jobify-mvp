'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Mail, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface EmailStats {
  emailsSentToday: number;
  dailyLimit: number;
  remaining: number;
  subscriptionStatus: string;
}

interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api.get('/email/stats'),
          api.get('/jobs'),
        ]);
        setEmailStats(statsRes.data);
        setRecentJobs(jobsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Emails Sent Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emailStats?.emailsSentToday || 0} / {emailStats?.dailyLimit || 20}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Remaining Emails</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emailStats?.remaining || 20}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subscription</p>
              <p className="text-2xl font-semibold text-gray-900 capitalize">
                {emailStats?.subscriptionStatus || 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Jobs</h2>
          <Link href="/dashboard/jobs" className="text-indigo-600 hover:text-indigo-500 text-sm">
            View all
          </Link>
        </div>
        <div className="divide-y">
          {recentJobs.length > 0 ? (
            recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="block px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.companyName}</p>
                  </div>
                  <span className="text-sm text-gray-500">{job.location}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-6 py-4 text-gray-500">No jobs available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
