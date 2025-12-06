import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('seeker' | 'recruiter' | 'admin')[];
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireOnboarding = false
}: ProtectedRouteProps) {
  const { user, hasHydrated, isAuthenticated } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as 'seeker' | 'recruiter' | 'admin')) {
    const redirectPath = user.role === 'admin' 
      ? '/dashboard/admin' 
      : user.role === 'recruiter' 
        ? '/dashboard/recruiter' 
        : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
