import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './lib/services/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Recruiters from './pages/Recruiters';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiters"
        element={
          <ProtectedRoute>
            <Recruiters />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
