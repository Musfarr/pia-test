import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useShortlists, useSettings } from '../hooks/useQueries';

// Stage filter chips shown above the table
const STAGE_FILTERS = [
  { key: 'creator', label: 'Creator Jury Shortlist (Top 10)', color: '#5006ba' },
  { key: 'executive', label: 'Executive Jury Shortlist (Top 5)', color: '#D97706' },
  { key: 'public', label: 'Public Voting Finalists', color: '#059669' },
];

export default function Shortlist() {
  const { data: settings } = useSettings();
  const [stageFilter, setStageFilter] = useState('creator');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { data: shortlists = [], isLoading } = useShortlists(stageFilter);

  const currentStage = settings?.currentStage || 'setup';

  // Group rows by category for display
  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of shortlists) {
      const catId = row.categoryId?._id || String(row.categoryId);
      const catName = row.categoryId?.name || 'Unknown Category';
      if (!map.has(catId)) map.set(catId, { name: catName, season: row.categoryId?.season, rows: [] });
      map.get(catId).rows.push(row);
    }
    // Sort each group by rank
    for (const [, group] of map) {
      group.rows.sort((a, b) => a.rank - b.rank);
    }
    return Array.from(map.entries());
  }, [shortlists]);

  const filteredGroups = useMemo(() => {
    if (!categoryFilter) return grouped;
    return grouped.filter(([catId]) => catId === categoryFilter);
  }, [grouped, categoryFilter]);

  // Helper: is the selected stage shortlist available yet?
  const stageAvailable = (() => {
    const order = ['setup', 'creator_rating', 'executive_rating', 'public_voting', 'completed'];
    const currentIdx = order.indexOf(currentStage);
    if (stageFilter === 'creator') return currentIdx > order.indexOf('creator_rating');
    if (stageFilter === 'executive') return currentIdx > order.indexOf('executive_rating');
    if (stageFilter === 'public') return currentIdx > order.indexOf('public_voting');
    return false;
  })();

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
        {STAGE_FILTERS.map((s) => {
          const active = stageFilter === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => { setStageFilter(s.key); setCategoryFilter(''); }}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: active ? `1px solid ${s.color}` : '1px solid #E5E7EB',
                background: active ? `${s.color}10` : '#fff',
                color: active ? s.color : '#6B7280',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </motion.div>

      {/* Category filter */}
      {grouped.length > 0 && (
        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
          <select
            className="date-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Category: All</option>
            {grouped.map(([catId, group]) => (
              <option key={catId} value={catId}>{group.name}</option>
            ))}
          </select>
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
              The <strong>{STAGE_FILTERS.find((s) => s.key === stageFilter)?.label}</strong> has not been computed yet.
              <br />It will be generated automatically when the platform advances to the next stage.
            </p>
          </div>
        </motion.div>
      ) : filteredGroups.length === 0 ? (
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
        <div className="d-flex flex-column gap-4">
          {filteredGroups.map(([catId, group]) => (
            <motion.div
              key={catId}
              className="card clt-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="clt-header">
                <div>
                  <h6 className="clt-title">{group.name}</h6>
                  <p className="clt-subtitle">
                    {group.season && <span className="clt-badge me-2" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>{group.season}</span>}
                    {group.rows.length} shortlisted
                  </p>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr className="clt-thead-row">
                        <th className="clt-th ps-4" style={{ width: '60px' }}>Rank</th>
                        <th className="clt-th">Nominee</th>
                        <th className="clt-th text-center">Creator Score</th>
                        <th className="clt-th text-center">Executive Score</th>
                        <th className="clt-th text-center">Combined</th>
                        <th className="clt-th text-center pe-4">Jury Votes</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {group.rows.map((row) => {
                        const nominee = row.nomineeId;
                        const nomineeName = typeof nominee === 'object' ? nominee?.name : 'Unknown';
                        return (
                          <tr key={row._id} className="clt-row">
                            <td className="ps-4 py-3">
                              <span
                                className="d-inline-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px', height: '28px', borderRadius: '50%',
                                  background: row.rank <= 3 ? '#5006ba15' : '#F3F4F6',
                                  color: row.rank <= 3 ? '#5006ba' : '#6B7280',
                                  fontSize: '13px', fontWeight: 700,
                                }}
                              >
                                {row.rank}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className="clt-avatar">{nomineeName.charAt(0).toUpperCase()}</div>
                                <div className="clt-name">{nomineeName}</div>
                              </div>
                            </td>
                            <td className="text-center clt-cell">
                              {row.creatorScore > 0 ? (
                                <span style={{ fontWeight: 600, color: '#5006ba' }}>
                                  {row.creatorScore.toFixed(1)}
                                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>/30</span>
                                </span>
                              ) : '—'}
                            </td>
                            <td className="text-center clt-cell">
                              {row.executiveScore > 0 ? (
                                <span style={{ fontWeight: 600, color: '#D97706' }}>
                                  {row.executiveScore.toFixed(1)}
                                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>/40</span>
                                </span>
                              ) : '—'}
                            </td>
                            <td className="text-center">
                              <span style={{ fontWeight: 700, color: '#059669' }}>
                                {row.score.toFixed(1)}
                                <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>/70</span>
                              </span>
                            </td>
                            <td className="pe-4 text-center clt-cell">
                              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                {row.creatorJuryCount > 0 && <span className="me-2">C: {row.creatorJuryCount}</span>}
                                {row.executiveJuryCount > 0 && <span>E: {row.executiveJuryCount}</span>}
                                {row.creatorJuryCount === 0 && row.executiveJuryCount === 0 && '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
