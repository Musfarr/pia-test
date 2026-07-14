import { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/dashboard.css';
import { AuthProvider, useAuth } from './context/AuthProvider.jsx';

function AppContent() {
  const { isLoggedIn, SetLogoutData } = useAuth();

  const router = useMemo(() => createBrowserRouter([
    {
      path: '/login',
      element: isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />,
    },
    {
      path: '/dashboard',
      element: isLoggedIn ? <Dashboard onLogout={SetLogoutData} /> : <Navigate to="/login" replace />,
      children: [{ index: true, element: <DashboardHome /> }],
    },
    {
      path: '/',
      element: <Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />,
    },
    {
      path: '*',
      element: <Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />,
    },
  ]), [isLoggedIn, SetLogoutData]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
