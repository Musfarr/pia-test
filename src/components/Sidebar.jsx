import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.svg';
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/dashboard/live-demo', label: 'Live Demo', icon: HeadphonesIcon },
];

export default function Sidebar({ isCollapsed, isMobileOpen, onToggle, onMobileClose }) {
  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <img src={logo} style={{width:'200px'}}></img>
            <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/dashboard'}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Icon />
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {isMobileOpen && <div className="sidebar-overlay d-lg-none" onClick={onMobileClose} />}
    </>
  );
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h3" />
      <path d="M20 18a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h3" />
      <path d="M4 18a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H4" />
      <path d="M4 18v-6a8 8 0 0 1 16 0" />
    </svg>
  );
}
