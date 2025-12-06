import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Email from './pages/Email';
import Saved from './pages/Saved';
import Account from './pages/Account';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import PostJob from './pages/recruiter/PostJob';
import Candidates from './pages/recruiter/Candidates';
import RecruiterAccount from './pages/recruiter/Account';

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
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/jobs" element={<Jobs />} />
      <Route path="/dashboard/jobs/:id" element={<JobDetail />} />
      <Route path="/dashboard/email" element={<Email />} />
      <Route path="/dashboard/saved" element={<Saved />} />
      <Route path="/dashboard/account" element={<Account />} />
      <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
      <Route path="/dashboard/recruiter/jobs" element={<RecruiterJobs />} />
      <Route path="/dashboard/recruiter/post-job" element={<PostJob />} />
      <Route path="/dashboard/recruiter/candidates" element={<Candidates />} />
      <Route path="/dashboard/recruiter/account" element={<RecruiterAccount />} />
    </Routes>
  );
}

export default App;
