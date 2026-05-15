import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import logo from '../assets/logo.svg'
import logosm from '../assets/logosm.png'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: GridIcon },
  { href: '/dashboard/live-demo', label: 'Live Demo', icon: HeadphonesIcon },
];

export default function Sidebar({ isCollapsed, isMobileOpen, onToggle, onMobileClose, onLogout }) {
  const { user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">

          {/* ── Header ── */}
          <div className="sidebar-header">
            {isCollapsed ? (
              <div className="sidebar-header-collapsed">
                <img className="sidebar-logo-collapsed" src={logosm} alt="Aivex" />
                <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Expand sidebar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div className="sidebar-header-expanded">
                  <img className="sidebar-logo-expanded" src={logo} alt="Aivex" />
                </div>
                <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Collapse sidebar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* ── Nav ── */}
          <nav className="sidebar-nav">
            {!isCollapsed && (
              <div className="sidebar-section-label">Main</div>
            )}
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

          {/* ── User Profile ── */}
          <div className="sidebar-user-wrap">
            {showLogout && !isCollapsed && (
              <button className="sidebar-logout-btn" onClick={onLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span>Sign Out</span>
              </button>
            )}
            <div
              className={`sidebar-user-card ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => setShowLogout(p => !p)}
            >
              <div className="sidebar-user-avatar">
                <i className="bi bi-person"></i>
              </div>
              {!isCollapsed && (
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user?.company_name || 'Administrator'}</div>
                  <div className="sidebar-user-role">{user?.role || 'Administrator'}</div>
                </div>
              )}
              {!isCollapsed && (
                <i className={`bi bi-chevron-${showLogout ? 'up' : 'down'} sidebar-user-chevron`}></i>
              )}
            </div>
          </div>

        </div>
      </div>

      {isMobileOpen && <div className="sidebar-overlay d-lg-none" onClick={onMobileClose} />}
    </>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M4 12v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H4" />
      <path d="M20 12v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3" />
    </svg>
  );
}
