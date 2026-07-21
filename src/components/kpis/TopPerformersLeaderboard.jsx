import { motion } from 'framer-motion';
import { useShortlists } from '../../hooks/useQueries';

export default function TopPerformersLeaderboard() {
  const { data: executiveRows = [] } = useShortlists('executive');
  const { data: creatorRows = [] } = useShortlists('creator');

  const usingExecutive = executiveRows.length > 0;
  const rows = usingExecutive ? executiveRows : creatorRows;
  const stageLabel = usingExecutive ? 'Executive' : 'Creator';

  const top5 = [...rows].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Top Performers</h6>
          <span className="kpi-sub">{stageLabel} shortlist</span>
        </div>

        {!top5.length ? (
          <div className="text-center py-4">
            <i className="bi bi-trophy" style={{ fontSize: '2rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }} />
            <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '13px' }}>No shortlist computed yet</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {top5.map((row, i) => (
              <motion.div
                key={row._id}
                className="d-flex align-items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className={`leaderboard-rank ${i === 0 ? 'leaderboard-rank--gold' : 'leaderboard-rank--default'}`}>
                  {i + 1}
                </div>
                <div className="flex-fill" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{row.nomineeId?.name || '—'}</div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{row.categoryId?.name || '—'}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#5006ba', flexShrink: 0 }}>
                  {Number(row.score || 0).toFixed(1)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
