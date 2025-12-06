import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Mail, Search, Loader2, User, Calendar, Check, X, Clock } from 'lucide-react';
import api from '@/lib/api';

interface EmailLog {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  recipientEmail: string;
  subject: string;
  status: string;
  sentAt: string;
  openedAt?: string;
}

export default function AdminEmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/email-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-600/20 text-green-400';
      case 'failed':
        return 'bg-red-600/20 text-red-400';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.recipientEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.subject.toLowerCase().includes(search.toLowerCase()) ||
      log.userId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Email Logs</h1>
            <p className="text-gray-400">View all sent emails</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Mail className="h-5 w-5" />
            <span>{logs.length} total emails</span>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by recipient, subject, or sender..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark pl-12 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark w-full md:w-48"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Sender</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Recipient</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Subject</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Status</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="border-b border-white/5 hover:bg-dark-700/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-400" />
                          </div>
                          <span className="text-white">{log.userId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{log.recipientEmail}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 truncate max-w-xs block">{log.subject}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No email logs found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
