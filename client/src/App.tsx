import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';

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
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/jobs" element={<Jobs />} />
      <Route path="/dashboard/jobs/:id" element={<JobDetail />} />
      <Route path="/dashboard/email" element={<Email />} />
      <Route path="/dashboard/saved" element={<Saved />} />
      <Route path="/dashboard/subscription" element={<Subscription />} />
      <Route path="/dashboard/account" element={<Account />} />
      <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
      <Route path="/dashboard/recruiter/jobs" element={<RecruiterJobs />} />
      <Route path="/dashboard/recruiter/post-job" element={<PostJob />} />
      <Route path="/dashboard/recruiter/candidates" element={<Candidates />} />
      <Route path="/dashboard/recruiter/account" element={<RecruiterAccount />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/dashboard/admin/users" element={<AdminUsers />} />
      <Route path="/dashboard/admin/jobs" element={<AdminJobs />} />
      <Route path="/dashboard/admin/email-logs" element={<AdminEmailLogs />} />
      <Route path="/dashboard/admin/recruiters" element={<AdminRecruiters />} />
      <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
    </Routes>
  );
}

export default App;
