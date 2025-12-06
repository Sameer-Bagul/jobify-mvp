import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Email from './pages/Email';
import Saved from './pages/Saved';
import Subscription from './pages/Subscription';
import Account from './pages/Account';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import PostJob from './pages/recruiter/PostJob';
import Candidates from './pages/recruiter/Candidates';
import RecruiterAccount from './pages/recruiter/Account';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminEmailLogs from './pages/admin/EmailLogs';
import AdminRecruiters from './pages/admin/Recruiters';
import AdminSettings from './pages/admin/Settings';

function App() {
  const hydrate = useAuthStore.persist.rehydrate;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Onboarding - requires auth but no role restriction */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      
      {/* Job Seeker routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/jobs" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <Jobs />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/jobs/:id" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <JobDetail />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/email" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <Email />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/saved" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <Saved />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/subscription" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <Subscription />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/account" element={
        <ProtectedRoute allowedRoles={['seeker']} requireOnboarding>
          <Account />
        </ProtectedRoute>
      } />
      
      {/* Recruiter routes */}
      <Route path="/dashboard/recruiter" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <RecruiterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/recruiter/jobs" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <RecruiterJobs />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/recruiter/post-job" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <PostJob />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/recruiter/candidates" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <Candidates />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/recruiter/account" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <RecruiterAccount />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/jobs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminJobs />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/email-logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminEmailLogs />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/recruiters" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminRecruiters />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSettings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
