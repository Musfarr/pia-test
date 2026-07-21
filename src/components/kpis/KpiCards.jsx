import { motion } from 'framer-motion';
import { useDashboardStats } from '../../hooks/useQueries';

const STAGE_LABELS = {
  setup: 'Setup',
  creator_rating: 'Creator Rating',
  executive_rating: 'Executive Rating',
  public_voting: 'Public Voting',
  completed: 'Completed',
};

// Card definitions per role — kept minimal & informative: icon, label, value, one-glance context.
// Plain counts use the neumorphic purple brand chip; status/text cards keep their
// semantic color (stage color, open/closed) since that meaning is used across the app.
const buildCards = (data) => {
  if (!data) return [];
  const stageLabel = STAGE_LABELS[data.currentStage] || data.currentStage;

  switch (data.role) {
    case 'super_admin':
      return [
        { icon: 'bi-flag', color: '#5006ba', label: 'Platform Stage', value: stageLabel, isText: true },
        { icon: 'bi-tag', label: 'Categories', value: data.categories, brand: true },
        { icon: 'bi-person-badge', label: 'Nominees', value: data.nominees, brand: true },
        { icon: 'bi-people', label: 'Jury Members', value: data.juryMembers, sub: `${data.creatorJury} Creator · ${data.executiveJury} Executive`, brand: true },
        // { icon: 'bi-pencil-square', label: 'Creator Scores', value: data.creatorScoresSubmitted, brand: true },
        // { icon: 'bi-award', label: 'Executive Scores', value: data.executiveScoresSubmitted, brand: true },
      ];
    case 'category_admin':
      return [
        { icon: 'bi-flag', color: '#5006ba', label: 'Platform Stage', value: stageLabel, isText: true },
        { icon: 'bi-tag', label: 'My Categories', value: data.categories, brand: true },
        { icon: 'bi-person-badge', label: 'Nominees', value: data.nominees, brand: true },
        {
          icon: 'bi-people',
          label: 'Assigned Jury',
          value: (data.juryAssignmentCoverage?.creatorJurors || 0) + (data.juryAssignmentCoverage?.executiveJurors || 0),
          sub: `${data.juryAssignmentCoverage?.creatorJurors || 0} Creator · ${data.juryAssignmentCoverage?.executiveJurors || 0} Executive`,
          brand: true,
        },
      ];
    case 'creator_jury':
    case 'executive_jury': {
      const pct = data.assigned ? Math.round((data.submitted / data.assigned) * 100) : 0;
      return [
        {
          icon: data.scoringOpen ? 'bi-unlock' : 'bi-lock',
          color: data.scoringOpen ? '#059669' : '#DC2626',
          label: 'Scoring Status',
          value: data.scoringOpen ? 'Open' : 'Closed',
          isText: true,
        },
        { icon: 'bi-person-badge', label: data.role === 'creator_jury' ? 'Assigned Nominees' : 'Assigned Finalists', value: data.assigned, brand: true },
        { icon: 'bi-check-circle', label: 'Submitted', value: data.submitted, sub: `${pct}% complete`, brand: true },
        { icon: 'bi-clock', label: 'Pending', value: data.pending, brand: true },
        // { icon: 'bi-star', label: 'Avg Score Given', value: `${data.avgScoreGiven}`, sub: '/100', brand: true },
      ];
    }
    default:
      return [
        { icon: 'bi-flag', color: '#5006ba', label: 'Platform Stage', value: stageLabel, isText: true },
        { icon: 'bi-tag', label: 'Categories', value: data.categories, brand: true },
        { icon: 'bi-person-badge', label: 'Nominees', value: data.nominees, brand: true },
        { icon: 'bi-people', label: 'Jury Members', value: data.juryMembers, brand: true },
      ];
  }
};

function KpiSkeleton({ count = 4 }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-sm-6 col-lg-3">
          <div className="card kpi-card h-100">
            <div className="kpi-card-body">
              <div className="kpi-skel-icon" />
              <div className="kpi-skel-line" style={{ width: '60%' }} />
              <div className="kpi-skel-line" style={{ width: '40%', height: '20px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KpiCards() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) return <KpiSkeleton />;
  if (isError || !data) return null;

  const cards = buildCards(data);
  if (!cards.length) return null;

  return (
    <div className="row g-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          className="col-sm-6 col-lg-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
        >
          <div className="card kpi-card h-100">
            <div className="kpi-card-body">
              <div
                className={`kpi-icon-wrap ${c.brand ? 'kpi-icon-wrap--brand' : ''}`}
                style={c.brand ? undefined : { background: `${c.color}15`, color: c.color }}
              >
                <i className={`bi ${c.icon}`} />
              </div>
              <span className="kpi-label">{c.label}</span>
              <div className="kpi-value-row">
                <span className="kpi-value" style={c.isText ? { color: c.color, fontSize: '20px' } : undefined}>
                  {c.value}
                </span>
                {c.sub && <span className="kpi-sub">{c.sub}</span>}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
