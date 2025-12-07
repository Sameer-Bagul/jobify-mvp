import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { logout } from '../lib/services/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiters', icon: Users, label: 'Recruiters' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gradient-to-b from-dark-800 to-dark-900 border-r border-dark-600 flex flex-col">
        <div className="p-6 border-b border-dark-600">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
            Jobify Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                        : 'text-gray-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-dark-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-dark-800/50 border-b border-dark-600 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-white">
            {navItems.find(item => item.to === location.pathname)?.label || 'Admin Panel'}
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>
        
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
