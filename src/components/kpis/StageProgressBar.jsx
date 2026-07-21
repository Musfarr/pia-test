import { motion } from 'framer-motion';
import { useSettings } from '../../hooks/useQueries';

const STAGES = [
  { key: 'setup', label: 'Setup' },
  { key: 'creator_rating', label: 'Creator Rating' },
  { key: 'executive_rating', label: 'Executive Rating' },
  { key: 'public_voting', label: 'Public Voting' },
  { key: 'completed', label: 'Completed' },
];

export default function StageProgressBar() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return null;

  const currentStage = settings?.currentStage || 'setup';
  const idx = Math.max(STAGES.findIndex((s) => s.key === currentStage), 0);
  const pct = (idx / (STAGES.length - 1)) * 100;

  return (
    <motion.div
      className="card insight-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="insight-card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Platform Progress</h6>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#5006ba' }}>{Math.round(pct)}% through the season</span>
        </div>
        <div className="stage-progress-track">
          <div className="stage-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="stage-progress-ticks">
          {STAGES.map((s, i) => (
            <div key={s.key} className={`stage-progress-tick ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}`}>
              <span className="stage-progress-dot" />
              <span className="stage-progress-tick-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
