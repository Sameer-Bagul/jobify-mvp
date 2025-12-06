import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Briefcase, Mail, TrendingUp, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  emailsSent: number;
  emailsRemaining: number;
  jobsViewed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/email/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout role="seeker">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your job search progress</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '-' : stats?.emailsSent || 0}</p>
                <p className="text-sm text-gray-400">Emails Sent Today</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '-' : stats?.emailsRemaining || 20}</p>
                <p className="text-sm text-gray-400">Emails Remaining</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '-' : stats?.jobsViewed || 0}</p>
                <p className="text-sm text-gray-400">Jobs Viewed</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">20</p>
                <p className="text-sm text-gray-400">Daily Email Limit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/dashboard/jobs"
                className="flex items-center gap-3 p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                <Briefcase className="h-5 w-5 text-purple-400" />
                <span className="text-white">Browse Jobs</span>
              </a>
              <a
                href="/dashboard/email"
                className="flex items-center gap-3 p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-white">Send Cold Emails</span>
              </a>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Tips for Success</h2>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Personalize each email with the company name
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Follow up within 3-5 days if no response
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Target companies that align with your skills
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Keep your resume updated and relevant
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
