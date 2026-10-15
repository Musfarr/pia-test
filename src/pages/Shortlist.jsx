import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShortlists, useSettings, useWithdrawnFinalists, useUpdateFinalistConsent } from '../hooks/useQueries';

// Stage filter chips shown above the table
const STAGE_FILTERS = [
  { key: 'creator', label: 'Creator Jury · Top 10', color: '#5006ba', icon: 'bi-pencil-square' },
  { key: 'executive', label: 'Executive Jury · Top 5', color: '#5006ba', icon: 'bi-award' },
  { key: 'public', label: 'Public Voting Finalists', color: '#5006ba', icon: 'bi-people' },
];

// Theme signature gradient — used across the app for avatars, buttons, active tabs.
// Defined once here so cards stay on-theme.
const THEME_GRADIENT = 'radial-gradient(circle at 60% 40%, #6510b4, #29055e)';

// Top 5 finalist consent options (null = pending)
const CONSENT_OPTIONS = [
  { value: null, label: 'Pending', color: '#6B7280' },
  { value: true, label: 'Consented', color: '#15803D' },
  { value: false, label: 'Declined', color: '#B91C1C' },
];

// ── Consent control — segmented Pending / Consented / Declined ──
function ConsentControl({ consent, disabled, onChange, loadingValue }) {
  const current = consent ?? null;
  return (
    <div style={{ padding: '0 14px 12px', display: 'flex', gap: '4px' }}>
      {CONSENT_OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            disabled={disabled || active}
            onClick={() => onChange(opt.value)}
            className="btn btn-sm"
            style={{
              flex: 1,
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 2px',
              borderRadius: '4px',
              border: `1px solid ${active ? opt.color : '#E5E7EB'}`,
              background: active ? `${opt.color}15` : '#fff',
              color: active ? opt.color : '#9CA3AF',
              opacity: 1,
            }}
          >
            {loadingValue === opt.value
              ? <output className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px', borderWidth: '2px' }}></output>
              : opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Nominee card — image-dominant with hover stats ──
function NomineeCard({ row, index, consentControl }) {
  const nominee = row.nomineeId;
  const nomineeName = typeof nominee === 'object' ? nominee?.name : 'Unknown';
  const initial = nomineeName?.charAt(0).toUpperCase();
  const isPodium = row.rank <= 3;
  const profileImage = typeof nominee === 'object' ? nominee?.profileImage : null;

  // Use nominee's profile photo if available, otherwise fall back to initial-letter avatar
  const cardImage = profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomineeName)}&size=400&background=E8E8EC&color=9CA3AF&bold=true`;

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
            style={{ objectPosition: 'top', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#E8E8EC"/><text x="50%" y="50%" font-size="120" font-weight="bold" fill="#9CA3AF" text-anchor="middle" dy=".35em">${initial}</text></svg>`)}`; }}
          />
          {/* Gradient overlay at bottom for name legibility */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />

          {/* Rank badge (top-left) */}
          <div
            style={{
              position: 'absolute',
              top: 10, left: 10,
              background: 'rgb(31 30 31)',
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
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
            <i className="bi bi-bar-chart me-1" style={{ color: '#6510b4' }}></i>
            {row.score.toFixed(1)}<span style={{ fontSize: '10px', color: '#9CA3AF' }}>/70</span>
          </span>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
            {row.creatorJuryCount + row.executiveJuryCount > 0
              ? `${row.creatorJuryCount + row.executiveJuryCount} votes`
              : 'No votes'}
          </span>
        </div>

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
      {/* Outside the card so the hover stats overlay doesn't cover it */}
      {consentControl && <div style={{ marginTop: '8px' }}>{consentControl}</div>}
    </motion.div>
  );
}

export default function Shortlist() {
  const { data: settings } = useSettings();
  const [stageFilter, setStageFilter] = useState('creator');
  const [activeCategory, setActiveCategory] = useState(null); // null = "All"
  const { data: shortlists = [], isLoading, isFetching } = useShortlists(stageFilter);

  const currentStage = settings?.currentStage || 'setup';

  // Finalist consent is managed on the Executive Top 5 while public voting is open
  const consentEditable = stageFilter === 'executive' && currentStage === 'public_voting';
  const { data: withdrawn = [] } = useWithdrawnFinalists(stageFilter === 'executive');
  const consentMutation = useUpdateFinalistConsent();
  const [consentError, setConsentError] = useState(null);

  // Declining or restoring reruns the Top 5, so it goes through a confirmation modal
  const [pendingConsent, setPendingConsent] = useState(null); // { nominee, consent, restore }
  const [recalculating, setRecalculating] = useState(false);
  const busy = consentMutation.isPending || recalculating;
  const loadingNomineeId = consentMutation.isPending ? consentMutation.variables?.nomineeId : null;

  const applyConsent = (nominee, consent) => {
    setConsentError(null);
    consentMutation.mutate(
      { nomineeId: nominee?._id, consent },
      {
        onSuccess: (data) => {
          setPendingConsent(null);
          // Keep the loader up until the recalculated Top 5 has been refetched
          if (data?.recalculated) setRecalculating(true);
        },
        onError: (err) => setConsentError(err?.response?.data?.message || 'Could not update consent'),
      }
    );
  };

  const setConsent = (nominee, consent, restore = false) => {
    if (consent === false || restore) {
      setConsentError(null);
      setPendingConsent({ nominee, consent, restore });
      return;
    }
    applyConsent(nominee, consent);
  };

  // Recalculation finished once the shortlist refetch completes
  React.useEffect(() => {
    if (recalculating && !consentMutation.isPending && !isFetching) setRecalculating(false);
  }, [recalculating, consentMutation.isPending, isFetching]);

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

      {/* Top 5 recalculation in progress */}
      {stageFilter === 'executive' && busy && (
        <div
          className="d-flex align-items-center gap-2 mb-3"
          style={{ padding: '10px 14px', borderRadius: '8px', background: '#5006ba10', color: '#5006ba', fontSize: '13px', fontWeight: 600 }}
        >
          <output className="spinner-border spinner-border-sm"></output>
          {recalculating || pendingConsent ? 'Recalculating Top 5 finalists…' : 'Saving consent…'}
        </div>
      )}

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
                <NomineeCard
                  key={row._id || i}
                  row={row}
                  index={i}
                  consentControl={stageFilter === 'executive' && (
                    <ConsentControl
                      consent={row.nomineeId?.finalistConsent}
                      disabled={!consentEditable || busy}
                      loadingValue={
                        loadingNomineeId && String(loadingNomineeId) === String(row.nomineeId?._id)
                          ? consentMutation.variables?.consent
                          : undefined
                      }
                      onChange={(value) => setConsent(row.nomineeId, value)}
                    />
                  )}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Finalist consent: errors + declined finalists (restorable) */}
      {stageFilter === 'executive' && consentError && !pendingConsent && (
        <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>{consentError}</div>
      )}
      {stageFilter === 'executive' && withdrawn.length > 0 && (
        <div className="card clt-card mb-5">
          <div className="card-body">
            <h6 className="cat-form-title mb-1">Withdrawn finalists</h6>
            <p className="cat-form-subtitle mb-3">
              These nominees declined consent and were replaced by the next contender in their category.
            </p>
            {withdrawn.map((n) => (
              <div key={n._id} className="d-flex align-items-center justify-content-between py-2" style={{ borderTop: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '14px' }}>
                  <strong>{n.name}</strong>
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}> · {n.categoryId?.name || 'Unknown Category'}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={!consentEditable || busy}
                  onClick={() => setConsent(n, null, true)}
                  style={{ fontSize: '12px', fontWeight: 600, border: '1px solid #5006ba', color: '#5006ba', background: '#fff' }}
                >
                  {loadingNomineeId && String(loadingNomineeId) === String(n._id)
                    ? <><output className="spinner-border spinner-border-sm me-2"></output>Restoring…</>
                    : 'Restore to Top 5'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consent confirmation modal (decline / restore reruns the Top 5) */}
      {pendingConsent && (
        <>
          <div
            className="modal-backdrop show"
            style={{ opacity: 0.5 }}
            onClick={() => !consentMutation.isPending && setPendingConsent(null)}
          />
          <div className="modal d-block" tabIndex="-1" onClick={() => !consentMutation.isPending && setPendingConsent(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
                <div className="modal-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '48px', height: '48px', borderRadius: '12px', fontSize: '22px',
                        background: pendingConsent.restore ? '#5006ba15' : '#FEE2E2',
                        color: pendingConsent.restore ? '#5006ba' : '#B91C1C',
                      }}
                    >
                      <i className={`bi ${pendingConsent.restore ? 'bi-arrow-counterclockwise' : 'bi-person-x'}`}></i>
                    </div>
                    <div>
                      <h6 className="mb-0" style={{ fontSize: '16px', fontWeight: 700 }}>
                        {pendingConsent.restore ? 'Restore Finalist' : 'Decline Finalist Consent'}
                      </h6>
                      <p className="mb-0" style={{ fontSize: '13px', color: '#6B7280' }}>
                        This recalculates the Top 5 for the category
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                    {pendingConsent.restore ? (
                      <>Restore <strong>{pendingConsent.nominee?.name}</strong> to the finalist ranking? If their score places them in the Top 5, the lowest-ranked contender will drop out.</>
                    ) : (
                      <>Mark <strong>{pendingConsent.nominee?.name}</strong> as declined? They will be removed from the Top 5 and the public voting page, and the next contender will take their place.</>
                    )}
                  </p>
                  {consentError && (
                    <div className="alert alert-danger py-2 mb-0" style={{ fontSize: '13px' }}>{consentError}</div>
                  )}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setPendingConsent(null)}
                      disabled={consentMutation.isPending}
                      style={{ borderRadius: '8px', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button
                      className="cat-form-submit"
                      onClick={() => applyConsent(pendingConsent.nominee, pendingConsent.consent)}
                      disabled={consentMutation.isPending}
                      style={{ width: 'auto', paddingLeft: '20px', paddingRight: '20px' }}
                    >
                      {consentMutation.isPending ? (
                        <><output className="spinner-border spinner-border-sm me-2"></output>Recalculating…</>
                      ) : (
                        <><i className="bi bi-check-lg me-2"></i>{pendingConsent.restore ? 'Restore' : 'Decline & Recalculate'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
