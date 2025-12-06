import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  Bookmark, 
  User, 
  LogOut,
  PlusCircle,
  Users,
  CreditCard,
  Settings,
  FileText,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface SidebarProps {
  role: 'seeker' | 'recruiter' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const seekerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/email', label: 'Cold Email', icon: Mail },
    { href: '/dashboard/saved', label: 'Saved', icon: Bookmark },
    { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/dashboard/account', label: 'My Account', icon: User },
  ];

  const recruiterLinks = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/recruiter/post-job', label: 'Post Job', icon: PlusCircle },
    { href: '/dashboard/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/dashboard/recruiter/candidates', label: 'Candidates', icon: Users },
    { href: '/dashboard/recruiter/account', label: 'My Account', icon: User },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/admin/email-logs', label: 'Email Logs', icon: FileText },
    { href: '/dashboard/admin/recruiters', label: 'Recruiters', icon: Shield },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : role === 'recruiter' ? recruiterLinks : seekerLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 glass-dark h-screen fixed left-0 top-0 border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Jobify
          </span>
        </Link>
      </div>

      <nav className="mt-6 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border-l-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
