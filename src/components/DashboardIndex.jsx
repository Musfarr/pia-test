import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { normalizeRole, getDefaultRoute } from '../util/roles';

/**
 * Handles the bare '/dashboard' index route.
 *
 * - super_admin sees the graph overview (DashboardHome).
 * - every other role is redirected to their role-specific default page.
 *
 * Usage: <DashboardIndex><DashboardHome /></DashboardIndex>
 */
export default function DashboardIndex({ children }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === 'super_admin') {
    return children;
  }

  const target = getDefaultRoute(user?.role);
  return <Navigate to={target} replace />;
}
