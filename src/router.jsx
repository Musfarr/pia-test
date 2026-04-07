import { createBrowserRouter, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import LiveDemo from './pages/LiveDemo';
import Login from './pages/Login';
import CallLayout from './pages/CallLayout';
import CallPage from './pages/CallPage';



export const createRouter = (isAuthenticated, onLogout) => {
  return createBrowserRouter([
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />,
    },
    {
      path: '/dashboard',
      element: isAuthenticated ? <Dashboard onLogout={onLogout} /> : <Navigate to="/login" replace />,
      children: [
        {
          index: true,
          element: <DashboardHome />,
        },
        {
          path: 'live-demo',
          element: <LiveDemo />,
        },
      ],
    },

    {
      path: '/call',
      element: isAuthenticated ? <CallLayout /> : <Navigate to="/login" replace />,
      children: [
        {
          index: true,
          element: <CallPage />,
        },
      ],
    },


    {
      path: '/',
      element: <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />,
    },
    {
      path: '*',
      element: <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />,
    },
  ]);
};
