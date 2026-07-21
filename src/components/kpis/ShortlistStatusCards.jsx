import { useShortlists } from '../../hooks/useQueries';

function StatusRow({ icon, title, rows, unit }) {
  const computed = rows.length > 0;
  const categories = new Set(rows.map((r) => r.categoryId?._id || r.categoryId)).size;

  return (
    <div className="shortlist-status-card">
      <div className="kpi-icon-wrap kpi-icon-wrap--dark" style={{ marginBottom: 0 }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="flex-fill">
        <div style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>{title}</div>
        {computed ? (
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            {rows.length} {unit} <span style={{ color: '#9CA3AF', fontWeight: 500 }}>· {categories} categories</span>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>Not yet computed</div>
        )}
      </div>
    </div>
  );
}

export default function ShortlistStatusCards() {
  const { data: creatorRows = [] } = useShortlists('creator');
  const { data: executiveRows = [] } = useShortlists('executive');

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body d-flex flex-column gap-3">
        <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Shortlist Status</h6>
        <StatusRow icon="bi-list-ol" title="Creator Shortlist (Top 10 / category)" rows={creatorRows} unit="nominees" />
        <StatusRow icon="bi-award" title="Executive Shortlist (Top 5 / category)" rows={executiveRows} unit="finalists" />
      </div>
    </div>
  );
}
