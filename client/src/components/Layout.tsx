import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/auth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  const role = (user.role as 'seeker' | 'recruiter' | 'admin') || 'seeker';

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar role={role} />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
