import { motion } from 'framer-motion';
import { useShortlists } from '../../hooks/useQueries';

// Polished leaderboard: avatar, score with max context, category badge.
export default function TopPerformersLeaderboard() {
  const { data: executiveRows = [] } = useShortlists('executive');
  const { data: creatorRows = [] } = useShortlists('creator');

  const usingExecutive = executiveRows.length > 0;
  const rows = usingExecutive ? executiveRows : creatorRows;
  const stageLabel = usingExecutive ? 'Executive' : 'Creator';
  const stageMax = usingExecutive ? 70 : 30; // executive max = 30+40, creator max = 30

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
            {top5.map((row, i) => {
              const nomineeName = row.nomineeId?.name || '—';
              const initial = nomineeName.charAt(0).toUpperCase();
              const profileImage = row.nomineeId?.profileImage;
              const score = Number(row.score || 0);
              const scorePct = Math.min((score / stageMax) * 100, 100);

              return (
                <motion.div
                  key={row._id}
                  className="d-flex align-items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  {/* Rank badge */}
                  <div className={`leaderboard-rank ${i === 0 ? 'leaderboard-rank--gold' : 'leaderboard-rank--default'}`}>
                    {i + 1}
                  </div>

                  {/* Avatar — nominee photo or initials fallback */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                      background: 'radial-gradient(circle at 60% 40%, #6510b4, #29055e)',
                    }}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt={nomineeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initial
                    )}
                  </div>

                  {/* Name + category badge */}
                  <div className="flex-fill" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {nomineeName}
                    </div>
                    <span className="clt-badge" style={{ fontSize: '10px', padding: '2px 8px', backgroundColor: '#ffffff', color: '#5006ba' }}>
                      {row.categoryId?.name || '—'}
                    </span>
                  </div>

                  {/* Score with max context + inline progress sliver */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#5006ba' }}>
                      {score.toFixed(1)}
                      <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>/{stageMax}</span>
                    </div>
                    <div style={{ width: '50px', height: '3px', borderRadius: '2px', background: '#E5E7EB', marginTop: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${scorePct}%`, height: '100%', background: 'radial-gradient(circle at 60% 40%, #6510b4, #29055e)', borderRadius: '2px' }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
