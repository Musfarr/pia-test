import { useState, useEffect } from 'react';
import { useDateRange } from '../context/DateRangeContext';

export default function DashboardHeader({ onLogout, onMobileMenuClick }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();

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

      <div className="d-flex align-items-center gap-3">
        <div className="header-date-range">
          <div className="header-date-field">
            <i className="bi bi-calendar3 header-date-icon" />
            <input
              type="date"
              className="header-date-input"
              value={startDate}
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
              title="Start date"
            />
          </div>
          <span className="header-date-sep">→</span>
          <div className="header-date-field">
            <i className="bi bi-calendar3 header-date-icon" />
            <input
              type="date"
              className="header-date-input"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              title="End date"
            />
          </div>
        </div>

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
