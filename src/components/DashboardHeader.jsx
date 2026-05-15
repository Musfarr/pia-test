import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';

export default function DashboardHeader({ onLogout, onMobileMenuClick }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="dashboard-header">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn-icon d-lg-none"
          type="button"
          onClick={onMobileMenuClick}
          aria-label="Open navigation"
        >
          <i className="bi bi-list" style={{ fontSize: '1.4rem' }}></i>
        </button>

        <div className='flex flex-col'>
        <h3>Overview</h3>
        <p>Real-time overview of your AI conversational platform</p>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button className="header-icon-btn" title="Notifications">
          <i className="bi bi-bell" style={{ fontSize: '1.1rem' }}></i>
        </button>
        <button
          className="header-icon-btn header-icon-btn--primary"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`} style={{ fontSize: '1.1rem' }}></i>
        </button>
        <button className="header-icon-btn" onClick={onLogout} title="Sign Out">
          <i className="bi bi-box-arrow-right" style={{ fontSize: '1.1rem' }}></i>
        </button>
      </div>
    </header>
  );
}
