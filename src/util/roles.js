// ── Role normalization ──
// Maps the various role strings used in the DB / JWT to canonical roles.
// This lets the frontend work regardless of whether the backend uses
// "admin" (current) or "super_admin" (planned), "Creator" or "creator_jury", etc.
const ROLE_MAP = {
  admin: 'super_admin',
  super_admin: 'super_admin',
  category_admin: 'category_admin',
  Creator: 'creator_jury',
  creator_jury: 'creator_jury',
  Executive: 'executive_jury',
  executive_jury: 'executive_jury',
  auditor: 'auditor',
};

export const normalizeRole = (role) => ROLE_MAP[role] || role;

// ── Role labels ──
export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  category_admin: 'Category Admin',
  creator_jury: 'Creator Jury',
  executive_jury: 'Executive Jury',
  auditor: 'Auditor',
};

export const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || 'User';

// ── Default landing route per role ──
// super_admin gets the graph dashboard at /dashboard;
// every other role lands on their first role-specific page.
export const ROLE_DEFAULT_ROUTE = {
  super_admin: '/dashboard',
  category_admin: '/dashboard/my-categories',
  creator_jury: '/dashboard/my-nominees',
  executive_jury: '/dashboard/my-finalists',
  auditor: '/dashboard/audit-logs',
};

export const getDefaultRoute = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_DEFAULT_ROUTE[normalized] || '/dashboard';
};

// ── Nav config per role ──
// icon = bootstrap-icons class (bi bi-*)
// The first item is the role's "Overview" / landing entry.
export const ROLE_NAV = {
  super_admin: [
    { href: '/dashboard', label: 'Overview', icon: 'bi-grid-1x2' },
    { href: '/dashboard/categories', label: 'Categories', icon: 'bi-tag' },
    { href: '/dashboard/jury', label: 'Jury', icon: 'bi-people' },
    { href: '/dashboard/nominees', label: 'Nominees', icon: 'bi-person-badge' },
    { href: '/dashboard/shortlist', label: 'Shortlist', icon: 'bi-trophy' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'bi-sliders' },
    { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: 'bi-shield-check' },
  ],
  category_admin: [
    { href: '/dashboard/my-categories', label: 'Overview', icon: 'bi-grid-1x2' },
    { href: '/dashboard/nominees', label: 'Nominees', icon: 'bi-person-badge' },
  ],
  creator_jury: [
    { href: '/dashboard/my-nominees', label: 'Overview', icon: 'bi-grid-1x2' },
    { href: '/dashboard/my-scores', label: 'My Scores', icon: 'bi-star' },
  ],
  executive_jury: [
    { href: '/dashboard/my-finalists', label: 'Overview', icon: 'bi-grid-1x2' },
    { href: '/dashboard/my-scores', label: 'My Scores', icon: 'bi-star' },
  ],
  auditor: [
    { href: '/dashboard/audit-logs', label: 'Overview', icon: 'bi-grid-1x2' },
  ],
};

// Returns the nav items for a given role (normalized).
// Falls back to an empty array if the role is unknown.
export const getNavItems = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_NAV[normalized] || [];
};

// ── Route access config ──
// Maps each dashboard sub-route to the canonical roles allowed to access it.
// Note: the bare index route ('/dashboard', the graph overview) is super_admin only.
// Non-admin roles are redirected from /dashboard to their ROLE_DEFAULT_ROUTE.
export const ROUTE_ROLES = {
  categories: ['super_admin'],
  jury: ['super_admin'],
  nominees: ['super_admin', 'category_admin'],
  'my-categories': ['category_admin'],
  'my-nominees': ['creator_jury'],
  'my-finalists': ['executive_jury'],
  'my-scores': ['creator_jury', 'executive_jury'],
  'settings': ['super_admin'],
  'shortlist': ['super_admin'],
  'audit-logs': ['auditor', 'super_admin'],
};

// Returns true if the given role can access the given route key.
export const canAccessRoute = (role, routeKey) => {
  const allowed = ROUTE_ROLES[routeKey];
  if (!allowed) return false;
  return allowed.includes(normalizeRole(role));
};
