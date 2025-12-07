import { useEffect, useState } from 'react';
import { Users, CreditCard, Briefcase, Mail } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats, DashboardStats } from '../lib/services/dashboard';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
        <p className="text-gray-400 mt-1">Here's what's happening with your platform today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers || 0}
          trend={`+${stats?.newUsersToday || 0} today`}
          color="purple"
        />
        <StatCard
          icon={CreditCard}
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          color="blue"
        />
        <StatCard
          icon={Briefcase}
          title="Total Recruiters"
          value={stats?.totalRecruiters || 0}
          color="green"
        />
        <StatCard
          icon={Mail}
          title="Emails Sent Today"
          value={stats?.emailsSentToday || 0}
          trend={`${stats?.totalEmailsSent || 0} total`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Job Seekers</span>
              <span className="text-white font-medium">{stats?.totalSeekers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Jobs</span>
              <span className="text-white font-medium">{stats?.totalJobs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Jobs</span>
              <span className="text-white font-medium">{stats?.activeJobs || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Emails Sent</span>
              <span className="text-white font-medium">{stats?.totalEmailsSent || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Users Today</span>
              <span className="text-accent-green font-medium">+{stats?.newUsersToday || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Recruiter Accounts</span>
              <span className="text-white font-medium">{stats?.totalRecruiters || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
