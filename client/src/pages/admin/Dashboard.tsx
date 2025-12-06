import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Users, Briefcase, Mail, CreditCard, TrendingUp, Activity } from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalEmails: number;
  totalSubscriptions: number;
  activeUsers: number;
  newUsersToday: number;
  emailsSentToday: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'purple',
      trend: stats?.newUsersToday || 0,
      trendLabel: 'new today',
    },
    {
      label: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Emails Sent',
      value: stats?.totalEmails || 0,
      icon: Mail,
      color: 'green',
      trend: stats?.emailsSentToday || 0,
      trendLabel: 'today',
    },
    {
      label: 'Subscriptions',
      value: stats?.totalSubscriptions || 0,
      icon: CreditCard,
      color: 'pink',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform performance</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">
                      {loading ? '-' : stat.value.toLocaleString()}
                    </p>
                    {stat.trend !== undefined && (
                      <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        +{stat.trend} {stat.trendLabel}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-600/20 flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-700">
                <span className="text-gray-400">Active Users (24h)</span>
                <span className="text-white font-semibold">{loading ? '-' : stats?.activeUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-700">
                <span className="text-gray-400">Revenue (Monthly)</span>
                <span className="text-green-400 font-semibold">
                  ₹{loading ? '-' : (stats?.revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-700">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-white font-semibold">
                  {loading ? '-' : stats?.totalUsers ? ((stats.totalSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/dashboard/admin/users"
                className="p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-center"
              >
                <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <span className="text-white text-sm">Manage Users</span>
              </a>
              <a
                href="/dashboard/admin/jobs"
                className="p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-center"
              >
                <Briefcase className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <span className="text-white text-sm">Manage Jobs</span>
              </a>
              <a
                href="/dashboard/admin/email-logs"
                className="p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-center"
              >
                <Mail className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <span className="text-white text-sm">Email Logs</span>
              </a>
              <a
                href="/dashboard/admin/settings"
                className="p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-center"
              >
                <CreditCard className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                <span className="text-white text-sm">Settings</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
