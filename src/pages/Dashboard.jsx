import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { DateRangeProvider } from '../context/DateRangeContext';

export default function Dashboard({ onLogout }) {
  const location = useLocation();
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
    <DateRangeProvider>
    <div className="dashboard-wrapper">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggle={toggleSidebar}
        onMobileClose={closeMobileSidebar}
        onLogout={onLogout}
      />

      <div className={`dashboard-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <DashboardHeader onLogout={onLogout} onMobileMenuClick={toggleSidebar} />

        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
    </DateRangeProvider>
  );
}
