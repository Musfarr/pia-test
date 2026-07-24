import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMyNominees, useSettings } from '../hooks/useQueries';
import KpiCards from '../components/kpis/KpiCards';

const THEME_GRADIENT = 'radial-gradient(circle at 60% 40%, #6510b4, #29055e)';

// ── Finalist card — image-dominant, clickable, hover reveals category + season ──
function FinalistCard({ item, index, onClick }) {
  const nomineeName = item.name || 'Unknown';
  const initial = nomineeName.charAt(0).toUpperCase();
  const cardImage = item.profileImage
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomineeName)}&size=400&background=E8E8EC&color=9CA3AF&bold=true`;
  const categoryName = item.categoryId?.name || '—';
  const season = item.season || '—';
  const scored = !!item.myScore;

  return (
    <motion.div
      className="col-12 col-6 col-md-4 col-lg-3 col-xl-2-4"
      style={{ flex: '0 0 20%', maxWidth: '20%' }}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div
        onClick={onClick}
        style={{
          background: '#F4F4F6',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.85)',
          transition: 'box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '10px 10px 20px rgba(0,0,0,0.12), -10px -10px 20px rgba(255,255,255,0.9), 0 0 0 1.5px rgba(80, 6, 186, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.85)';
        }}
      >
        {/* Image section */}
        <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
          <img
            src={cardImage}
            alt={nomineeName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#E8E8EC"/><text x="50%" y="50%" font-size="120" font-weight="bold" fill="#9CA3AF" text-anchor="middle" dy=".35em">${initial}</text></svg>`)}`;
            }}
          />
          {/* Gradient overlay at bottom for name legibility */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '90px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />

          {/* Scored badge (top-right) */}
          {scored && (
            <div
              style={{
                position: 'absolute',
                top: 10, right: 10,
                background: 'rgba(5, 150, 105, 0.9)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <i className="bi bi-check-circle-fill me-1"></i>Scored
            </div>
          )}

          {/* Name (always visible, overlaid on image) */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              {nomineeName}
            </div>
          </div>
        </div>

        {/* Bottom bar — always visible: score + chevron */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>
            {scored ? (
              <>
                <i className="bi bi-star-fill me-1" style={{ color: '#6510b4' }}></i>
                {Math.round(item.myScore.avgScore ?? 0)}<span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>/100</span>
              </>
            ) : (
              <>
                <i className="bi bi-clock me-1" style={{ color: '#D97706' }}></i>
                <span style={{ color: '#D97706' }}>Pending</span>
              </>
            )}
          </span>
          <i className="bi bi-chevron-right" style={{ fontSize: '16px', color: '#9CA3AF' }}></i>
        </div>

        {/* Hover overlay — category + season slide up from bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '20px 16px',
            background: 'linear-gradient(to top, rgb(0 0 0 / 92%), rgb(0 0 0 / 80%))',
            transform: 'translateY(100%)',
            transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            pointerEvents: 'none',
          }}
          className="finalist-hover-info"
        >
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '4px' }}>
            Category
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            {categoryName}
          </div>
          <div className="d-flex align-items-center gap-2">
            {/* <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
              <i className="bi bi-calendar3 me-1"></i>{season}
            </span> */}
            {/* {scored && (
              <span style={{ fontSize: '12px', color: '#dbff00', fontWeight: 600 }}>
                · {Math.round(item.myScore.avgScore ?? 0)}/100
              </span>
            )} */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Executive Jury view — same data source as MyNominees (getMyNominees)
// but framed as "finalists" shortlisted for executive scoring.
// Renders as image-dominant cards grouped by category tabs.
export default function MyFinalists() {
  const navigate = useNavigate();
  const { data: nominees = [], isLoading } = useMyNominees();
  const { data: settings } = useSettings();
  const [activeCategory, setActiveCategory] = useState(null); // null = "All"

  const scoringOpen = settings?.currentStage === 'executive_rating';

  // Group nominees by category
  const grouped = useMemo(() => {
    const map = new Map();
    for (const n of nominees) {
      const cat = n.categoryId;
      if (!cat) continue;
      const catId = cat._id || cat;
      const catName = cat.name || '—';
      if (!map.has(catId)) map.set(catId, { id: catId, name: catName, items: [] });
      map.get(catId).items.push(n);
    }
    return Array.from(map.entries()).map(([id, g]) => [id, g]);
  }, [nominees]);

  // Currently visible cards (filtered by active category tab)
  const visibleItems = useMemo(() => {
    if (!activeCategory) return nominees;
    const group = grouped.find(([id]) => id === activeCategory);
    return group ? group[1].items : [];
  }, [nominees, activeCategory, grouped]);

  const submittedCount = nominees.filter((n) => n.myScore).length;

  return (
    <div className="container-fluid px-3">

       {/* Header */}
      {/* <motion.div
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
            <h6 className="cat-form-title mb-0" style={{ fontSize: '20px' }}>My Finalists</h6>
            <p className="cat-form-subtitle mb-0">
              Top 10 finalists per category for Executive Jury scoring · {submittedCount}/{nominees.length} scored
            </p>
          </div>
        </div>
      </motion.div> */}
      {/* KPI Row */}
      <div className="mb-3">
        <KpiCards />
      </div>

      {/* Scoring status banner */}
      {!scoringOpen && (
        <motion.div
          className="alert d-flex align-items-center gap-2 mb-3"
          style={{
            borderRadius: '12px', fontSize: '13px',
            background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '12px 16px',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <i className="bi bi-lock-fill" style={{ fontSize: '16px' }}></i>
          <span>
            Executive Jury scoring is currently <strong>closed</strong>. The platform is in the{' '}
            <strong>{settings?.currentStage?.replace(/_/g, ' ') || 'setup'}</strong> stage.
            You can review finalists but cannot submit scores right now.
          </span>
        </motion.div>
      )}

     

      {isLoading ? (
        <div className="text-center py-5">
          <output className="spinner-border text-primary"></output>
          <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading your finalists…</p>
        </div>
      ) : !nominees.length ? (
        <motion.div
          className="card clt-card text-center py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#D1D5DB', display: 'block', marginBottom: '12px' }}></i>
          <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            No finalists available yet. The Creator Jury shortlist (Top 10 per category) will appear here once the creator rating stage is completed.
          </p>
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
              <i className="bi bi-grid me-1"></i>All ({nominees.length})
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
                  {group.name} <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 400 }}>({group.items.length})</span>
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
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                · {visibleItems.length} finalists
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
              {visibleItems.map((item, i) => (
                <FinalistCard
                  key={item._id}
                  item={item}
                  index={i}
                  onClick={() => navigate(`/dashboard/my-finalists/${item._id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
