import { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Categories from './pages/Categories';
import Jury from './pages/Jury';
import Nominees from './pages/Nominees';
import NomineeProfile from './pages/NomineeProfile';
import MyCategories from './pages/MyCategories';
import MyNominees from './pages/MyNominees';
import MyFinalists from './pages/MyFinalists';
import MyScores from './pages/MyScores';
import RateNominee from './pages/RateNominee';
import Settings from './pages/Settings';
import Shortlist from './pages/Shortlist';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import RoleRoute from './components/ProtectedRoute';
import DashboardIndex from './components/DashboardIndex';
import { getDefaultRoute } from './util/roles';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/dashboard.css';
import { AuthProvider, useAuth } from './context/AuthProvider.jsx';

function AppContent() {
  const { isLoggedIn, user, SetLogoutData } = useAuth();
  const homeRoute = isLoggedIn ? getDefaultRoute(user?.role) : '/login';

  const router = useMemo(() => createBrowserRouter([
    {
      path: '/login',
      element: isLoggedIn ? <Navigate to={homeRoute} replace /> : <Login />,
    },
    {
      path: '/dashboard',
      element: isLoggedIn ? <Dashboard onLogout={SetLogoutData} /> : <Navigate to="/login" replace />,
      children: [
        { index: true, element: <DashboardIndex><DashboardHome /></DashboardIndex> },
        { path: 'categories', element: <RoleRoute routeKey="categories"><Categories /></RoleRoute> },
        { path: 'jury', element: <RoleRoute routeKey="jury"><Jury /></RoleRoute> },
        { path: 'nominees', element: <RoleRoute routeKey="nominees"><Nominees /></RoleRoute> },
        { path: 'nominees/:id', element: <RoleRoute routeKey="nominees"><NomineeProfile /></RoleRoute> },
        { path: 'my-categories', element: <RoleRoute routeKey="my-categories"><MyCategories /></RoleRoute> },
        { path: 'my-nominees', element: <RoleRoute routeKey="my-nominees"><MyNominees /></RoleRoute> },
        { path: 'my-nominees/:id', element: <RoleRoute routeKey="my-nominees"><RateNominee /></RoleRoute> },
        { path: 'my-finalists', element: <RoleRoute routeKey="my-finalists"><MyFinalists /></RoleRoute> },
        { path: 'my-finalists/:id', element: <RoleRoute routeKey="my-finalists"><RateNominee /></RoleRoute> },
        { path: 'my-scores', element: <RoleRoute routeKey="my-scores"><MyScores /></RoleRoute> },
        { path: 'settings', element: <RoleRoute routeKey="settings"><Settings /></RoleRoute> },
        { path: 'shortlist', element: <RoleRoute routeKey="shortlist"><Shortlist /></RoleRoute> },
        { path: 'audit-logs', element: <RoleRoute routeKey="audit-logs"><AuditLogs /></RoleRoute> },
      ],
    },
    {
      path: '/',
      element: <Navigate to={homeRoute} replace />,
    },
    {
      path: '*',
      element: <Navigate to={homeRoute} replace />,
    },
  ]), [isLoggedIn, user, homeRoute, SetLogoutData]);

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
