import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthProvider';
import logo from '../assets/logo.svg'
import logosm from '../assets/logosm.png'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: GridIcon },
];

const fadeSlide = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.15 },
};

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
            <AnimatePresence mode="wait" initial={false}>
              {isCollapsed ? (
                <motion.div
                  key="collapsed-header"
                  className="sidebar-header-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <img className="sidebar-logo-collapsed" src={logosm} alt="Aivex" />
                  <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Expand sidebar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="expanded-header"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="sidebar-header-expanded">
                    <img className="sidebar-logo-expanded" src={logo} alt="Aivex" />
                  </div>
                  <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Collapse sidebar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Nav ── */}
          <nav className="sidebar-nav">
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  className="sidebar-section-label"
                  {...fadeSlide}
                >
                  Main
                </motion.div>
              )}
            </AnimatePresence>
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/dashboard'}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Icon />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span key={`label-${href}`} {...fadeSlide}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </nav>

          {/* ── User Profile ── */}
          <div className="sidebar-user-wrap">
            <AnimatePresence initial={false}>
              {showLogout && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <button className="sidebar-logout-btn" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className={`sidebar-user-card ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => setShowLogout(p => !p)}
            >
              <div className="sidebar-user-avatar">
                <i className="bi bi-person"></i>
              </div>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div className="sidebar-user-info" key="user-info" {...fadeSlide}>
                    <div className="sidebar-user-name">{user?.company_name || 'Administrator'}</div>
                    <div className="sidebar-user-role">{user?.role || 'Administrator'}</div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.i
                    key="chevron"
                    className={`bi bi-chevron-${showLogout ? 'up' : 'down'} sidebar-user-chevron`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar-overlay d-lg-none"
            onClick={onMobileClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
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
