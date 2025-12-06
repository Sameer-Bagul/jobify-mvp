import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Send, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface EmailLog {
  _id: string;
  recipientEmail: string;
  subject: string;
  status: string;
  createdAt: string;
}

export default function Email() {
  const [searchParams] = useSearchParams();
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState({ emailsSent: 0, emailsRemaining: 20 });

  const jobTitle = searchParams.get('job');
  const company = searchParams.get('company');

  useEffect(() => {
    if (jobTitle && company) {
      setSubject(`Application for ${jobTitle} position at ${company}`);
      setBody(`Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${company}. I believe my skills and experience make me a strong candidate for this role.

I would welcome the opportunity to discuss how I can contribute to your team.

Best regards`);
    }
  }, [jobTitle, company]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/email/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/email/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/email/send', { to, subject, body });
      setSuccess(true);
      setTo('');
      setSubject('');
      setBody('');
      fetchLogs();
      fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Cold Email</h1>
          <p className="text-gray-400">
            {stats.emailsRemaining} of 20 emails remaining today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Compose Email</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Email sent successfully!
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="input-dark"
                  placeholder="recruiter@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-dark"
                  placeholder="Application for [Position]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="input-dark h-48 resize-none"
                  placeholder="Write your message..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending || stats.emailsRemaining <= 0}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Email
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Emails</h2>
            
            {logs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No emails sent yet</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <div key={log._id} className="p-3 bg-dark-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate">
                        {log.recipientEmail}
                      </span>
                      {getStatusIcon(log.status)}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{log.subject}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
