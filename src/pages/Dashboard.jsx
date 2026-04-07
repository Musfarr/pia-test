import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import FullscreenToggle from '../components/FullscreenToggle';

export default function Dashboard({ onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 991.98px)');

    const handleViewportChange = (event) => {
      setIsMobileViewport(event.matches);
      if (event.matches) {
        setIsMobileSidebarOpen(false);
        setIsSidebarCollapsed(false);
      }
    };

    handleViewportChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleViewportChange);
      } else {
        mediaQuery.removeListener(handleViewportChange);
      }
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobileViewport) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }

    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };


  // Dashboard Layout Component
  // with collapsible sidebar and header



  return (
    <div className="dashboard-wrapper">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggle={toggleSidebar}
        onMobileClose={closeMobileSidebar}
      />

      <div className={`dashboard-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <DashboardHeader onLogout={onLogout} onMobileMenuClick={toggleSidebar} />

        <div className="dashboard-content " >
          <div className="px-4 py-4">
            <Outlet />
          </div>
        </div>

        <FullscreenToggle />
      </div>
    </div>
  );
}
