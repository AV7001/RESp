import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { useAuth } from './contexts/AuthContext';
import './index.css';

function PrivateRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (requireAdmin) {
    // Check if user email is in admin list
    const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL;
    if (!isAdmin) return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requireAdmin>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
