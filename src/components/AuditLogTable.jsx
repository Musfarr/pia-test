import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuditLogs } from '../hooks/useQueries';

// Action badge color mapping — reuses existing semantic tokens only
const ACTION_BADGES = {
  // Create — purple (brand)
  'category.create': { label: 'Create', class: 'log-badge--create' },
  'category_admin.create': { label: 'Create', class: 'log-badge--create' },
  'jury.create': { label: 'Create', class: 'log-badge--create' },
  'nominee.create': { label: 'Create', class: 'log-badge--create' },
  // Update — amber
  'category.update': { label: 'Update', class: 'log-badge--update' },
  'jury.update': { label: 'Update', class: 'log-badge--update' },
  'jury.assign_category': { label: 'Assign', class: 'log-badge--update' },
  'nominee.update': { label: 'Update', class: 'log-badge--update' },
  'nominee.platform_data.update': { label: 'Edit Data', class: 'log-badge--update' },
  'settings.stage_change': { label: 'Stage Change', class: 'log-badge--update' },
  // Delete — red
  'category.delete': { label: 'Delete', class: 'log-badge--delete' },
  'category_admin.delete': { label: 'Delete', class: 'log-badge--delete' },
  'jury.delete': { label: 'Delete', class: 'log-badge--delete' },
  'nominee.delete': { label: 'Delete', class: 'log-badge--delete' },
  // Auth — gray
  'auth.login': { label: 'Login', class: 'log-badge--login' },
  'auth.login_failed': { label: 'Login Failed', class: 'log-badge--delete' },
  // Score — green
  'jury_score.submit': { label: 'Score Submitted', class: 'log-badge--score' },
  'jury_score.resubmit': { label: 'Score Changed', class: 'log-badge--update' },
};

const formatTimestamp = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatMetadata = (metadata) => {
  if (!metadata) return null;
  const lines = [];

  // Before → After for changed fields
  if (metadata.before && metadata.after) {
    for (const key of Object.keys(metadata.after)) {
      const before = metadata.before[key];
      const after = metadata.after[key];
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        if (before == null) {
          lines.push({ label: key, value: `${JSON.stringify(after)}` });
        } else {
          lines.push({ label: key, value: `${JSON.stringify(before)} → ${JSON.stringify(after)}` });
        }
      }
    }
  }

  // Extra metadata (e.g. shortlistSummary, fields)
  if (metadata.shortlistSummary) {
    const s = metadata.shortlistSummary;
    if (s.error) {
      lines.push({ label: 'Shortlist', value: `Error: ${s.error}` });
    } else if (s.count != null) {
      lines.push({ label: 'Shortlist', value: `${s.count} nominees (${s.stage} stage)` });
    }
  }

  if (metadata.fields) {
    lines.push({ label: 'Fields updated', value: Object.keys(metadata.fields).join(', ') });
  }

  return lines.length ? lines : null;
};

export default function AuditLogTable() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);

  // Build filter params
  const filters = {
    page,
    limit: 25,
    ...(search && { search }),
    ...(actionFilter && { action: actionFilter }),
    ...(targetFilter && { targetType: targetFilter }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading } = useAuditLogs(filters);
  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleReset = () => {
    setSearch('');
    setActionFilter('');
    setTargetFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasFilters = search || actionFilter || targetFilter || dateFrom || dateTo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="card clt-card">
        {/* Header */}
        <div className="clt-header">
          <div>
            <h6 className="clt-title">Audit Logs</h6>
            <p className="clt-subtitle">
              Login, creation, edit, and rating activity across the platform · {total} entries
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="clt-search-wrap">
              <i className="bi bi-search clt-search-icon" />
              <input
                className="clt-search-input"
                type="text"
                placeholder="Search user or target…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="date-filter-select" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
              <option value="">All Actions</option>
              <optgroup label="Create">
                <option value="category.create">Category Create</option>
                <option value="jury.create">Jury Create</option>
                <option value="nominee.create">Nominee Create</option>
                <option value="category_admin.create">Admin Create</option>
              </optgroup>
              <optgroup label="Update">
                <option value="category.update">Category Update</option>
                <option value="jury.update">Jury Update</option>
                <option value="jury.assign_category">Jury Assign</option>
                <option value="nominee.update">Nominee Update</option>
                <option value="nominee.platform_data.update">Platform Data Edit</option>
                <option value="settings.stage_change">Stage Change</option>
              </optgroup>
              <optgroup label="Delete">
                <option value="category.delete">Category Delete</option>
                <option value="jury.delete">Jury Delete</option>
                <option value="nominee.delete">Nominee Delete</option>
                <option value="category_admin.delete">Admin Delete</option>
              </optgroup>
              <optgroup label="Auth">
                <option value="auth.login">Login</option>
                <option value="auth.login_failed">Login Failed</option>
              </optgroup>
              <optgroup label="Scoring">
                <option value="jury_score.submit">Score Submitted</option>
                <option value="jury_score.resubmit">Score Changed</option>
              </optgroup>
            </select>
            <select className="date-filter-select" value={targetFilter} onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}>
              <option value="">All Entities</option>
              <option value="Category">Category</option>
              <option value="CategoryAdmin">Category Admin</option>
              <option value="Nominee">Nominee</option>
              <option value="Jury">Jury</option>
              <option value="JuryScore">Jury Score</option>
              <option value="Settings">Settings</option>
              <option value="Auth">Auth</option>
            </select>
            {hasFilters && (
              <button className="clt-reset-btn" onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
              </button>
            )}
          </div>
        </div>

        {/* Date range filter row */}
        <div className="d-flex align-items-center gap-3 px-3 pb-3 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>From:</span>
            <input type="date" className="date-filter-select" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={{ width: 'auto' }} />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>To:</span>
            <input type="date" className="date-filter-select" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={{ width: 'auto' }} />
          </div>
        </div>

        {/* Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="clt-thead-row">
                  <th className="clt-th ps-4">Timestamp</th>
                  <th className="clt-th">User</th>
                  <th className="clt-th">Action</th>
                  <th className="clt-th">Target</th>
                  <th className="clt-th text-center pe-4">Details</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading logs…</p>
                    </td>
                  </tr>
                ) : !items.length ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                      <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                        {hasFilters ? 'No logs match your filters' : 'No log entries recorded yet'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((log) => {
                    const badge = ACTION_BADGES[log.action] || { label: log.action, class: 'log-badge--login' };
                    const metaLines = formatMetadata(log.metadata);
                    const isExpanded = expandedRow === log._id;

                    return (
                      <React.Fragment key={log._id}>
                        <tr
                          className="clt-row"
                          style={{ cursor: metaLines ? 'pointer' : 'default' }}
                          onClick={() => metaLines && setExpandedRow(isExpanded ? null : log._id)}
                        >
                          <td className="ps-4 py-3" style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                            {formatTimestamp(log.createdAt)}
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="clt-avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                                {log.actor?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                                  {log.actor?.name || 'Unknown'}
                                </div>
                                {log.actor?.role && (
                                  <span className="clt-badge" style={{ fontSize: '9px', padding: '1px 6px', backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                                    {log.actor.role.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`log-badge ${badge.class}`}>{badge.label}</span>
                          </td>
                          <td className="py-3" style={{ fontSize: '13px', color: '#374151' }}>
                            {log.targetLabel || '—'}
                          </td>
                          <td className="pe-4 text-center py-3">
                            {metaLines ? (
                              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '14px', color: '#9CA3AF' }}></i>
                            ) : (
                              <span style={{ color: '#D1D5DB', fontSize: '13px' }}>—</span>
                            )}
                          </td>
                        </tr>
                        {/* Expanded details row */}
                        <AnimatePresence>
                          {isExpanded && metaLines && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <td colSpan="5" className="px-4 py-3" style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
                                <div className="d-flex flex-column gap-1">
                                  {metaLines.map((line, i) => (
                                    <div key={i} style={{ fontSize: '12.5px', color: '#6B7280' }}>
                                      <span style={{ fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{line.label}:</span>{' '}
                                      <span style={{ color: '#6B7280' }}>{line.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between p-3 border-top">
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
