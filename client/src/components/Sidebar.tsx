'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  Bookmark, 
  User, 
  LogOut,
  PlusCircle,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface SidebarProps {
  role: 'seeker' | 'recruiter';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const seekerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/email', label: 'Cold Email', icon: Mail },
    { href: '/dashboard/saved', label: 'Saved', icon: Bookmark },
    { href: '/dashboard/account', label: 'My Account', icon: User },
  ];

  const recruiterLinks = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/recruiter/post-job', label: 'Post Job', icon: PlusCircle },
    { href: '/dashboard/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/dashboard/recruiter/candidates', label: 'Candidates', icon: Users },
    { href: '/dashboard/recruiter/account', label: 'My Account', icon: User },
  ];

  const links = role === 'recruiter' ? recruiterLinks : seekerLinks;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center">
          <Briefcase className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">JobSeeker Pro</span>
        </Link>
      </div>

      <nav className="mt-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
