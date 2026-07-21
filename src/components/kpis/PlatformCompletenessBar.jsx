import { useDashboardStats } from '../../hooks/useQueries';

export default function PlatformCompletenessBar() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading || !data?.platformDataCompleteness) return null;

  const { complete, total, pct } = data.platformDataCompleteness;

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Platform Data Completeness</h6>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#5006ba' }}>{pct}%</span>
        </div>
        <div className="gradient-progress-track mb-2">
          <div className="gradient-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
          {complete}/{total} nominees have all 5 platforms filled (followers &gt; 0)
        </span>
      </div>
    </div>
  );
}
