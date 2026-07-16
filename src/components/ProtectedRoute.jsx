import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { normalizeRole, ROUTE_ROLES } from '../util/roles';

/**
 * Wraps a route element so only users with an allowed role can see it.
 * Everyone else is redirected to /dashboard (their default landing).
 *
 * Usage: <RoleRoute routeKey="categories"><Categories /></RoleRoute>
 */
export default function RoleRoute({ routeKey, children }) {
  const { user } = useAuth();
  const allowed = ROUTE_ROLES[routeKey];

  if (!allowed) {
    // Unknown route key — deny by default
    return <Navigate to="/dashboard" replace />;
  }

  const normalized = normalizeRole(user?.role);
  if (!allowed.includes(normalized)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
