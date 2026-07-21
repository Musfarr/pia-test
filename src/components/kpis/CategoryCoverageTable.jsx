import { useDashboardStats } from '../../hooks/useQueries';

export default function CategoryCoverageTable() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading || !data?.perCategoryCoverage) return null;

  const { perCategoryCoverage, coverageStage } = data;
  const stageLabel = coverageStage === 'executive' ? 'Executive' : 'Creator';

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <h6 className="mb-3 insight-card-title">
          {stageLabel} Scoring Coverage by Category
        </h6>
        {!perCategoryCoverage.length ? (
          <p className="mb-0 text-center py-4" style={{ color: '#9CA3AF', fontSize: '14px' }}>No categories yet</p>
        ) : (
          <div className="d-flex flex-column gap-3 kpi-scroll-list">
            {perCategoryCoverage.map((cat) => (
              <div key={cat.categoryId} className="d-flex align-items-center gap-3">
                <div
                  className="kpi-icon-wrap kpi-icon-wrap--brand"
                  style={{ marginBottom: 0, width: '38px', height: '38px', fontSize: '15px', flexShrink: 0 }}
                >
                  <i className="bi bi-tag" />
                </div>
                <span style={{ color: '#374151', fontSize: '14px', fontWeight: 500, minWidth: '120px' }}>{cat.name}</span>
                <div className="gradient-progress-track flex-fill">
                  <div className="gradient-progress-fill" style={{ width: `${cat.pct}%` }} />
                </div>
                <span style={{ fontSize: '13px', color: '#6B7280', minWidth: '56px', textAlign: 'right', flexShrink: 0 }}>
                  {cat.scoredCount}/{cat.nomineeCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
