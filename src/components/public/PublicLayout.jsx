import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { usePublicAuth } from '../../context/PublicAuthProvider';

export default function PublicLayout() {
  const { voter, clearVoterSession } = usePublicAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearVoterSession();
    navigate('/vote/login');
  };

  return (
    <div className="pv-app">
      {/* Top bar */}
      <div className="pv-topbar">
        <div className="pv-topbar-left">
          {/* <span className="pv-topbar-logo">PIA</span> */}
          {voter && (
            <span className="pv-topbar-greeting">Hi, {voter.name?.split(' ')[0]}</span>
          )}
        </div>
        <button className="pv-topbar-logout" onClick={handleLogout} title="Log out">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>

      {/* Page content */}
      <div className="pv-content">
        <Outlet />
      </div>

      {/* Bottom tab bar */}
      <div className="pv-tabbar">
        <NavLink to="/vote" end className={({ isActive }) => `pv-tab-item ${isActive ? 'pv-tab-item--active' : ''}`}>
          <i className="bi bi-grid-1x2"></i>
          <span>Categories</span>
        </NavLink>
        <NavLink to="/vote/my-votes" className={({ isActive }) => `pv-tab-item ${isActive ? 'pv-tab-item--active' : ''}`}>
          <i className="bi bi-check2-circle"></i>
          <span>My Votes</span>
        </NavLink>
      </div>
    </div>
  );
}
