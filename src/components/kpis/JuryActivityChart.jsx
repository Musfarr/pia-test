import { useDashboardStats } from '../../hooks/useQueries';

export default function JuryActivityChart() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading || !data?.juryActivity) return null;

  const { juryActivity } = data;
  const maxBar = Math.max(...juryActivity.map((j) => Math.max(j.assigned, j.submitted)), 1);

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <h6 className="mb-3 insight-card-title">Jury Activity</h6>
        {!juryActivity.length ? (
          <p className="mb-0 text-center py-4" style={{ color: '#9CA3AF', fontSize: '14px' }}>No jury members yet</p>
        ) : (
          <div className="d-flex flex-column gap-3 kpi-scroll-list">
            {juryActivity.map((j) => (
              <div key={j.jurorId} className="jury-activity-row">
                <div style={{ minWidth: '110px', flexShrink: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{j.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{j.type} Jury</div>
                </div>
                <div className="jury-activity-track">
                  <div
                    className={`jury-activity-fill ${j.submitted === 0 && j.assigned > 0 ? 'jury-activity-fill--inactive' : ''}`}
                    style={{ width: `${(j.submitted / maxBar) * 100}%` }}
                  />
                </div>
                <span style={{ fontSize: '13px', color: '#6B7280', minWidth: '56px', textAlign: 'right', flexShrink: 0 }}>
                  {j.submitted}/{j.assigned}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
