import { useAuth } from '../context/AuthProvider';

export default function DashboardHeader({ onLogout, onMobileMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="dashboard-header shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn-icon d-lg-none"
          type="button"
          onClick={onMobileMenuClick}
          aria-label="Open navigation"
        >
          <i className="bi bi-list" style={{ fontSize: '1.4rem' }}></i>
        </button>
        {/* You could add a title or breadcrumbs here if needed */}
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="user-info d-flex align-items-center gap-3 pe-3 border-end">
          <div className="user-avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.company_name || 'User'}&background=4f46e5&color=fff&bold=true`}
              alt="User"
              className="shadow-sm"
              style={{ borderRadius: '10px', width: '38px', height: '38px' }}
            />
          </div>
          <div className="user-details d-none d-md-block text-end">
            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>{user?.company_name || 'Administrator'}</h6>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.user_email || 'System Access'}</small>
          </div>
        </div>

        <button className="btn-icon" onClick={onLogout} title="Sign Out">
          <i className="bi bi-box-arrow-right" style={{ fontSize: '1.2rem' }}></i>
        </button>
      </div>
    </header>
  );
}
