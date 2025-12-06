import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/auth';

interface LayoutProps {
  children: ReactNode;
  role?: 'seeker' | 'recruiter';
}

export default function Layout({ children, role = 'seeker' }: LayoutProps) {
  const navigate = useNavigate();
  const { user, hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated()) {
      navigate('/login');
    }
  }, [hasHydrated, isAuthenticated, navigate]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar role={role} />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
