import { useDashboardStats } from '../../hooks/useQueries';

// Redesigned: instead of a bar per juror (redundant with Category Coverage),
// only surface the lagging jurors an admin needs to act on.
// If everyone is caught up, show a clean empty-state.
export default function JuryActivityChart() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading || !data?.juryActivity) return null;

  const { juryActivity } = data;

  if (!juryActivity.length) {
    return (
      <div className="card insight-card h-100">
        <div className="insight-card-body">
          <h6 className="mb-3 insight-card-title">Jury Status</h6>
          <div className="text-center py-4">
            <i className="bi bi-people" style={{ fontSize: '2rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }} />
            <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '13px' }}>No jury members yet</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show jurors who are lagging: assigned > 0 and submitted/assigned < 0.5
  const laggingJurors = juryActivity.filter(
    (j) => j.assigned > 0 && j.submitted / j.assigned < 0.5
  );

  const caughtUpCount = juryActivity.filter(
    (j) => j.assigned === 0 || j.submitted / j.assigned >= 0.5
  ).length;

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <h6 className="mb-2 insight-card-title">Jury Status</h6>

        {/* Summary line */}
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          {laggingJurors.length === 0 ? (
            <span style={{ color: '#059669', fontWeight: 600 }}>
              <i className="bi bi-check-circle-fill me-1"></i>
              All {juryActivity.length} jurors are up to date
            </span>
          ) : (
            <span>
              <strong style={{ color: '#DC2626' }}>{laggingJurors.length}</strong> of {juryActivity.length} jurors need attention
            </span>
          )}
        </div>

        {/* Lagging jurors list — or empty state */}
        {laggingJurors.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2.5rem', color: '#059669', display: 'block', marginBottom: '10px' }} />
            <p className="mb-0" style={{ color: '#059669', fontSize: '14px', fontWeight: 600 }}>All jurors are up to date</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 kpi-scroll-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {laggingJurors.map((j) => {
              const pct = j.assigned > 0 ? (j.submitted / j.assigned) * 100 : 0;
              const isZero = j.submitted === 0;
              return (
                <div
                  key={j.jurorId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    // background: isZero ? 'rgba(220, 38, 38, 0.04)' : 'rgba(217, 119, 6, 0.04)',
                    boxShadow: '3px 3px 8px rgba(0,0,0,0.08), -3px -3px 8px rgba(255,255,255,0.85)',
                    border: `2px solid ${isZero ? 'rgba(220, 38, 38, 0.12)' : 'rgba(217, 119, 6, 0.12)'}`,
                    
                  }}
                >
                  {/* Status dot */}
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: isZero ? '#DC2626' : '#D97706',
                    }}
                  />
                  {/* Name + type */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {j.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{j.type} Jury</div>
                  </div>
                  {/* Submitted/assigned count */}
                  <span style={{ fontSize: '13px', fontWeight: 700, flexShrink: 0, color: isZero ? '#DC2626' : '#D97706' }}>
                    {j.submitted}/{j.assigned}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
