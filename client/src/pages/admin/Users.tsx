import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Users, Search, Ban, Check, Loader2, User, Mail, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  onboardingCompleted: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/ban`, { isBanned: !isBanned });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isBanned: !isBanned } : u
      ));
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
            <p className="text-gray-400">Manage platform users</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="h-5 w-5" />
            <span>{users.length} total users</span>
          </div>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-12 w-full"
            />
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
                    <th className="text-left text-sm font-medium text-gray-400 p-4">User</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Role</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Joined</th>
                    <th className="text-left text-sm font-medium text-gray-400 p-4">Status</th>
                    <th className="text-right text-sm font-medium text-gray-400 p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-dark-700/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-600/20 text-purple-400'
                            : user.role === 'recruiter'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        {user.isBanned ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400">
                            Banned
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleBanToggle(user._id, user.isBanned)}
                          disabled={actionLoading === user._id || user.role === 'admin'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ml-auto ${
                            user.role === 'admin'
                              ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                              : user.isBanned
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                              : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          }`}
                        >
                          {actionLoading === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isBanned ? (
                            <>
                              <Check className="h-4 w-4" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4" />
                              Ban
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
