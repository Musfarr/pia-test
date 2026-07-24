import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShortlists, useSettings } from '../hooks/useQueries';

// Stage filter chips shown above the table
const STAGE_FILTERS = [
  { key: 'creator', label: 'Creator Jury · Top 10', color: '#5006ba', icon: 'bi-pencil-square' },
  { key: 'executive', label: 'Executive Jury · Top 5', color: '#5006ba', icon: 'bi-award' },
  { key: 'public', label: 'Public Voting Finalists', color: '#5006ba', icon: 'bi-people' },
];

// Theme signature gradient — used across the app for avatars, buttons, active tabs.
// Defined once here so cards stay on-theme.
const THEME_GRADIENT = 'radial-gradient(circle at 60% 40%, #6510b4, #29055e)';

// ── Nominee card — image-dominant with hover stats ──
function NomineeCard({ row, index }) {
  const nominee = row.nomineeId;
  const nomineeName = typeof nominee === 'object' ? nominee?.name : 'Unknown';
  const initial = nomineeName.charAt(0).toUpperCase();
  const isPodium = row.rank <= 3;
  const profileImage = typeof nominee === 'object' ? nominee?.profileImage : null;

  // Use nominee's profile photo if available, otherwise fall back to initial-letter avatar
  const cardImage = profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomineeName)}&size=400&background=E8E8EC&color=9CA3AF&bold=true`;

  return (
    <motion.div
      className="col-12 col-sm-6 col-lg-4 col-xl-3"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div
        className="sl-card sl-card--image-dominant"
        style={{
          background: '#F4F4F6',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isPodium
            ? '8px 8px 16px rgba(0,0,0,0.10), -8px -8px 16px rgba(255,255,255,0.9), 0 0 0 1.5px rgba(80, 6, 186, 0.35)'
            : '8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.85)',
        }}
      >
        {/* Image section — majority of card */}
        <div className="sl-image-wrap" style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <img
            src={cardImage}
            alt={nomineeName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#E8E8EC"/><text x="50%" y="50%" font-size="120" font-weight="bold" fill="#9CA3AF" text-anchor="middle" dy=".35em">${initial}</text></svg>`)}`; }}
          />
          {/* Gradient overlay at bottom for name legibility */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />

          {/* Rank badge (top-left) */}
          <div
            style={{
              position: 'absolute',
              top: 10, left: 10,
              background:'rgb(31 30 31)' ,
              color: '#dbff00',
              fontSize: '13px',
              fontWeight: 700,
              width: '32px', height: '32px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {row.rank}
          </div>

          {/* Name + season (always visible, overlaid on image) */}
          <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {nomineeName}
            </div>
            {/* <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
              {typeof nominee === 'object' ? nominee?.season : '—'}
            </div> */}
          </div>
        </div>

        {/* Basic stats bar — always visible */}
        {/* <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
            <i className="bi bi-bar-chart me-1" style={{ color: '#6510b4' }}></i>
            {row.score.toFixed(1)}<span style={{ fontSize: '10px', color: '#9CA3AF' }}>/70</span>
          </span>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
            {row.creatorJuryCount + row.executiveJuryCount > 0
              ? `${row.creatorJuryCount + row.executiveJuryCount} votes`
              : 'No votes'}
          </span>
        </div> */}

        {/* Hover stats overlay — slides up on hover */}
        <div className="sl-hover-stats">
          <div className="d-flex gap-2">
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Creator</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#dbff00' }}>
                {row.creatorScore > 0 ? row.creatorScore.toFixed(1) : '—'}
                {row.creatorScore > 0 && <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>/30</span>}
              </div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Executive</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#dbff00' }}>
                {row.executiveScore > 0 ? row.executiveScore.toFixed(1) : '—'}
                {row.executiveScore > 0 && <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>/40</span>}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center mt-2" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
            {/* <span>
              {row.creatorJuryCount > 0 && <span className="me-2">C: {row.creatorJuryCount}</span>}
              {row.executiveJuryCount > 0 && <span>E: {row.executiveJuryCount}</span>}
            </span> */}
            <span style={{ fontWeight: 700, color: '#dbff00', fontSize: '22px' }}>
              {row.score.toFixed(1)}<span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)' }}>/70</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Shortlist() {
  const { data: settings } = useSettings();
  const [stageFilter, setStageFilter] = useState('creator');
  const [activeCategory, setActiveCategory] = useState(null); // null = "All"
  const { data: shortlists = [], isLoading } = useShortlists(stageFilter);

  const currentStage = settings?.currentStage || 'setup';

  // Group rows by category
  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of shortlists) {
      const catId = row.categoryId?._id || String(row.categoryId);
      const catName = row.categoryId?.name || 'Unknown Category';
      const catSeason = row.categoryId?.season;
      if (!map.has(catId)) map.set(catId, { id: catId, name: catName, season: catSeason, rows: [] });
      map.get(catId).rows.push(row);
    }
    for (const [, group] of map) {
      group.rows.sort((a, b) => a.rank - b.rank);
    }
    return Array.from(map.entries()).map(([id, g]) => [id, g]);
  }, [shortlists]);

  // Currently visible cards (filtered by active category tab)
  const visibleRows = useMemo(() => {
    if (!activeCategory) return shortlists.slice().sort((a, b) => a.rank - b.rank);
    const group = grouped.find(([id]) => id === activeCategory);
    return group ? group[1].rows : [];
  }, [shortlists, activeCategory, grouped]);

  // Is the selected stage shortlist available yet?
  const stageAvailable = (() => {
    const order = ['setup', 'creator_rating', 'executive_rating', 'public_voting', 'completed'];
    const currentIdx = order.indexOf(currentStage);
    if (stageFilter === 'creator') return currentIdx > order.indexOf('creator_rating');
    if (stageFilter === 'executive') return currentIdx > order.indexOf('executive_rating');
    if (stageFilter === 'public') return currentIdx > order.indexOf('public_voting');
    return false;
  })();

  const activeStageDef = STAGE_FILTERS.find((s) => s.key === stageFilter);

  return (
    <div className="container-fluid px-3">

      {/* Header */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="clt-avatar" style={{ background: '#5006ba15', color: '#5006ba' }}>
            <i className="bi bi-trophy"></i>
          </div>
          <div>
            <h6 className="cat-form-title mb-1">Shortlisted Candidates</h6>
            <p className="cat-form-subtitle mb-0">
              System-computed shortlists for each stage across all categories.
              Current platform stage: <strong>{currentStage.replace(/_/g, ' ')}</strong>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stage filter chips */}
      <motion.div
        className="d-flex align-items-center gap-2 flex-wrap mb-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
          {/* border-radius: 5px;
    padding: 12px 18px;
    font-size: 16px;
    font-weight: 600;
    border: 2px solid rgb(80 6 186 / 63%);
    background: #f3f4f6;
    color: rgb(80, 6, 186); */}


        {STAGE_FILTERS.map((s) => {
          const active = stageFilter === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => { setStageFilter(s.key); setActiveCategory(null); }}
              className="btn btn-sm"
              style={{
                borderRadius: '5px',
                padding: '12px 18px',
                fontSize: '16px',
                fontWeight: '600',
                border: active ? `2px solid ${s.color}` : '1px solid #E5E7EB',
                background: active ? `#fff` : '#fff',
                color: active ? s.color : '#6B7280',
              }}
            >
              <i className={`bi ${s.icon} me-1`}></i>{s.label}
            </button>
          );
        })}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-5">
          <output className="spinner-border text-primary"></output>
          <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading shortlists…</p>
        </div>
      ) : !stageAvailable ? (
        <motion.div
          className="card clt-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
            <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>
              The <strong>{activeStageDef?.label}</strong> has not been computed yet.
              <br />It will be generated automatically when the platform advances to the next stage.
            </p>
          </div>
        </motion.div>
      ) : !grouped.length ? (
        <motion.div
          className="card clt-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
            <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No shortlisted candidates found for this stage.</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Category tabs */}
          <motion.div
            className="d-flex align-items-center gap-2 flex-wrap mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="btn btn-sm"
              style={{
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: activeCategory === null ? '1px solid #5006ba' : '1px solid #E5E7EB',
                background: activeCategory === null ? '#5006ba10' : '#fff',
                color: activeCategory === null ? '#5006ba' : '#6B7280',
              }}
            >
              <i className="bi bi-grid me-1"></i>All ({shortlists.length})
            </button>
            {grouped.map(([catId, group]) => {
              const active = activeCategory === catId;
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setActiveCategory(catId)}
                  className="btn btn-sm"
                  style={{
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: active ? '1px solid #5006ba' : '1px solid #E5E7EB',
                    background: active ? '#5006ba10' : '#fff',
                    color: active ? '#5006ba' : '#6B7280',
                  }}
                >
                  {group.name} <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 400 }}>({group.rows.length})</span>
                </button>
              );
            })}
          </motion.div>

          {/* Active category header (when one is selected) */}
          {activeCategory && (
            <motion.div
              className="d-flex align-items-center gap-2 mb-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <i className="bi bi-folder2-open" style={{ color: '#5006ba', fontSize: '16px' }}></i>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                {grouped.find(([id]) => id === activeCategory)?.[1].name}
              </span>
              <span className="clt-badge" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>
                {grouped.find(([id]) => id === activeCategory)?.[1].season}
              </span>
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                · {visibleRows.length} shortlisted
              </span>
            </motion.div>
          )}

          {/* Cards grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory || 'all'}
              className="row g-4 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {visibleRows.map((row, i) => (
                <NomineeCard key={row._id || i} row={row} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
