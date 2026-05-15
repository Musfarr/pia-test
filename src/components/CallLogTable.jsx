import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserQueries } from '../services/api';

export default function CallLogTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [activeTab, setActiveTab] = useState('user');
  const [filters, setFilters] = useState({
    status: '',
    city_name: '',
  });

  const queryParams = useMemo(() => ({ ...filters, limit, skip }), [filters, limit, skip]);

  const { data: userQueriesResponse, isLoading } = useQuery({
    queryKey: ['userQueries', queryParams],
    queryFn: () => getUserQueries(queryParams),
  });

  const filterOptions = {
    cities: ['Faisalabad', 'Islamabad', 'Karachi', 'Lahore', 'Multan', 'Rawalpindi'],
    statuses: ['closed', 'in_progress', 'new', 'resolved'],
  };
  const records = userQueriesResponse?.data.user_queries?.records || [];
  const orphan_calls = userQueriesResponse?.data.orphan_calls?.records || [];
  const total = userQueriesResponse?.data?.user_queries?.total;
  const total_orphan_calls = userQueriesResponse?.data?.orphan_calls?.total;
  const isAnyLoading = isLoading;
  const isControlsDisabled = isLoading;

  const isOrphanTab = activeTab === 'orphan';
  const displayedRecords = isOrphanTab ? orphan_calls : records;
  const totalRecords = isOrphanTab ? total_orphan_calls : total;

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = totalRecords ? Math.max(1, Math.ceil(totalRecords / limit)) : 1;

  useEffect(() => {
    setSkip(0);
    setExpandedRow(null);
  }, [filters, limit]);

  const toggleTranscript = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      city_name: '',
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    setSkip(0);
    setExpandedRow(null);
  };

  return (
    <div className="card call-log-table" >
      <div className="  py-4 px-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Recent Inquiries</h6>
            <p className="mb-0 mt-1" style={{ color: '#6B7280', fontSize: '12px' }}>Manage and track all customer communications</p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex gap-1 p-1 rounded-3" style={{ backgroundColor: '#F3F4F6' }}>
              <button
                type="button"
                className="btn btn-sm fw-medium"
                style={!isOrphanTab ? { backgroundColor: '#fff', color: '#111827', borderRadius: '8px', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { background: 'none', color: '#6B7280', fontSize: '13px', border: 'none' }}
                onClick={() => handleTabChange('user')}
                disabled={isControlsDisabled}
              >
                User Inquiries ({total || 0})
              </button>
              <button
                type="button"
                className="btn btn-sm fw-medium"
                style={isOrphanTab ? { backgroundColor: '#fff', color: '#111827', borderRadius: '8px', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { background: 'none', color: '#6B7280', fontSize: '13px', border: 'none' }}
                onClick={() => handleTabChange('orphan')}
                disabled={isControlsDisabled}
              >
                Orphan Calls ({total_orphan_calls || 0})
              </button>
            </div>

            {!isOrphanTab && (
              <>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm border-0"
                    style={{ borderRadius: '8px', backgroundColor: '#F9FAFB', width: 'auto', minWidth: '130px', fontSize: '13px', color: '#374151' }}
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    disabled={isControlsDisabled}
                  >
                    <option value="">Status: All</option>
                    {(filterOptions?.statuses || []).map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select form-select-sm border-0"
                    style={{ borderRadius: '8px', backgroundColor: '#F9FAFB', width: 'auto', minWidth: '130px', fontSize: '13px', color: '#374151' }}
                    value={filters.city_name}
                    onChange={(e) => handleFilterChange('city_name', e.target.value)}
                    disabled={isControlsDisabled}
                  >
                    <option value="">City: All</option>
                    {(filterOptions?.cities || []).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-sm text-decoration-none fw-semibold" style={{ color: '#2DD4BF', fontSize: '13px' }} onClick={clearFilters} disabled={isControlsDisabled}>
                  Reset Filters
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                {isOrphanTab ? (
                  <>
                    <th className="ps-4 border-0 py-3 text-uppercase fw-semibold" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Caller Info</th>
                    <th className="border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Duration</th>
                    <th className="border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Sentiment</th>
                    <th className="border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Date & Time</th>
                    <th className="pe-4 border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Actions</th>
                  </>
                ) : (
                  <>
                    <th className="ps-4 border-0 py-3 text-uppercase fw-semibold" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Customer Info</th>
                    <th className="border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Location</th>
                    <th className="border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Status</th>
                    <th className="border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Date & Time</th>
                    <th className="pe-4 border-0 py-3 text-uppercase fw-semibold text-center" style={{ letterSpacing: '0.06em', fontSize: '11px', color: '#9CA3AF' }}>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="border-top-0">
              {isAnyLoading && !displayedRecords?.length ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary1 spinner-border-sm me-2" />
                    <span className="text-muted">Loading records...</span>
                  </td>
                </tr>
              ) : !displayedRecords?.length ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="text-muted opacity-50 mb-2 mt-2">
                      <i className="bi bi-inbox fs-1"></i>
                    </div>
                    <p className="text-muted fw-medium">No results found for your filters</p>
                  </td>
                </tr>
              ) : (
                displayedRecords.map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    {/* The main data row */}
                    <tr
                      className={expandedRow === item.id ? 'bg-light bg-opacity-50' : ''}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => (item.recording_text || item.summary) && toggleTranscript(item.id)}
                    >
                      {isOrphanTab ? (
                        <>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="avatar me-3 rounded-circle d-flex align-items-center justify-content-center bg-white border border-light shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <span className="fw-bold text-primary1" style={{ fontSize: '13px' }}>{(item.caller_num || 'O').toString().charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <div className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>{item.caller_num || 'Unknown Caller'}</div>
                                <div className="text-muted small text-mono" style={{ fontSize: '0.75rem' }}>Orphan Call</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="text-secondary small fw-medium">{item.call_duration || '--'}</span>
                          </td>
                          <td className="text-center">
                            <span className={`badge px-3 py-2 fw-semibold text-capitalize`} style={{
                              backgroundColor: `var(--bg-accent)`,
                              color: `var(--${getSentimentColor(item.customer_sentiment)})`,
                              fontSize: '0.7rem'
                            }}>
                              {item.customer_sentiment || 'Unknown'}
                            </span>
                          </td>
                          <td className="text-center text-muted small">
                            {item.created_at || '--'}
                          </td>
                          <td className="pe-4 text-center">
                            <div className="d-flex gap-2 justify-content-center" onClick={e => e.stopPropagation()}>
                              {(item.recording_text || item.summary) && (
                                <button
                                  className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${expandedRow === item.id ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                                  style={{ width: '32px', height: '32px' }}
                                  onClick={() => toggleTranscript(item.id)}
                                >
                                  <i className={`bi bi-chat-text${expandedRow === item.id ? '-fill' : ''}`}></i>
                                </button>
                              )}
                              {item.recording_url && (
                                <a
                                  href={item.recording_url.replace('http://', 'https://')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-light border-0 rounded-circle d-flex align-items-center justify-content-center text-primary1"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <i className="bi bi-play-fill text-primary1"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="avatar me-3 rounded-circle d-flex align-items-center justify-content-center bg-white border border-light shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <span className="fw-bold text-primary1" style={{ fontSize: '13px' }}>{(item.name || 'U').charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <div className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>{item.name || 'Unknown User'}</div>
                                <div className="text-muted small text-mono" style={{ fontSize: '0.75rem' }}>{item.email || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="text-secondary small fw-medium">{item.city_name || item.city || '--'}</span>
                          </td>
                          <td className="text-center">
                            <span className={`badge px-3 py-2 fw-semibold text-capitalize`} style={{
                              backgroundColor: `var(--bg-accent)`,
                              color: `var(--${getStatusColor(item.status)})`,
                              fontSize: '0.7rem'
                            }}>
                              {item.status || 'N/A'}
                            </span>
                          </td>
                          <td className="text-center text-muted small">
                            {item.created_at ? new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
                          </td>
                          <td className="pe-4 text-center">
                            <div className="d-flex gap-2 justify-content-center" onClick={e => e.stopPropagation()}>
                              {(item.recording_text || item.summary) && (
                                <button
                                  className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${expandedRow === item.id ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                                  style={{ width: '32px', height: '32px' }}
                                  onClick={() => toggleTranscript(item.id)}
                                >
                                  <i className={`bi bi-chat-text${expandedRow === item.id ? '-fill' : ''}`}></i>
                                </button>
                              )}
                              {item.recordings && (
                                <a
                                  href={item.recordings.replace('http://', 'https://')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-light border-0 rounded-circle d-flex align-items-center justify-content-center text-primary1"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <i className="bi bi-play-fill text-primary1"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {/* The expandable transition row */}
                    <tr>
                      <td colSpan="5" className="p-0 border-0">
                        <div className={`expandable-wrapper ${expandedRow === item.id ? 'expanded' : ''}`}>
                          <div className="expandable-content">
                            {(item.recording_text || item.summary) && (
                              <div className="p-4 mx-4 mb-4 rounded-4 bg-white border border-light shadow-lg">
                                <div className="row g-4">
                                  {item.recording_text && (
                                    <div className="col-lg-7 border-end border-light">
                                      <div className="d-flex align-items-center mb-4">
                                        <div className="p-2 bg-primary-light text-primary1 rounded-3 me-3"><i className="bi bi-chat-left-dots"></i></div>
                                        <h6 className="mb-0 fw-bold">Live Transcript</h6>
                                      </div>
                                      <div className="chat-container bg-light bg-opacity-50 rounded-4 p-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {item.recording_text.split('\n').map((line, i) => {
                                          const isAgent = line.toLowerCase().startsWith('agent:');
                                          const content = line.replace(/^(Agent:|Caller:)\s*/i, '');
                                          if (!content) return null;

                                          return (
                                            <div key={i} className={`mb-4 d-flex ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                                              <div className={`p-3 rounded-4 ${isAgent ? 'text-white shadow-sm' : 'bg-white border text-dark shadow-xs'}`} style={{
                                                maxWidth: '85%',
                                                fontSize: '13px',
                                                backgroundColor: isAgent ? '#7cb342' : '#fff',
                                                lineHeight: '1.5',
                                                borderRadius: isAgent ? '20px 20px 4px 20px' : '20px 20px 20px 4px'
                                              }}>
                                                <div className={`fw-bold mb-1 small text-uppercase ${isAgent ? 'text-white-50' : 'text-primary1 opacity-75'}`} style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                                                  {isAgent ? 'AI Agent' : 'Customer'}
                                                </div>
                                                {content}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {item.summary && (
                                    <div className="col-lg-5">
                                      <div className="d-flex align-items-center mb-4">
                                        <div className="p-2 bg-warning-subtle text-warning rounded-3 me-3"><i className="bi bi-magic"></i></div>
                                        <h6 className="mb-0 fw-bold">AI Insight Summary</h6>
                                      </div>
                                      <div className="bg-light bg-opacity-50 p-4 rounded-4" style={{ minHeight: '100px' }}>
                                        <p className="mb-0 text-secondary" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                                          {item.summary}
                                        </p>
                                      </div>
                                      {item.customer_sentiment && (
                                        <div className="mt-4 p-3 rounded-4 border border-light d-flex align-items-center justify-content-between">
                                          <span className="small fw-bold text-muted text-uppercase">Detected Sentiment</span>
                                          <span className={`badge px-3 py-2 rounded-pill bg-${item.customer_sentiment.toLowerCase() === 'positive' ? 'success' : 'secondary'}-subtle text-${item.customer_sentiment.toLowerCase() === 'positive' ? 'success' : 'secondary'}`}>
                                            {item.customer_sentiment}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-footer bg-white border-0 py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ borderTop: '1px solid #F3F4F6' }}>
        <div className="small text-muted font-medium">
          Showing <span className="text-dark fw-bold">{skip + 1}</span> to <span className="text-dark fw-bold">{Math.min(skip + limit, totalRecords || 0)}</span> of <span className="text-dark fw-bold">{totalRecords || 0}</span> records
        </div>

        <nav className="d-flex align-items-center gap-4">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Per page:</span>
            <select
              className="form-select form-select-sm border-0 fw-bold"
              style={{ width: 'auto', borderRadius: '8px', backgroundColor: '#F9FAFB', fontSize: '13px' }}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={isControlsDisabled}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="btn-group gap-1">
            <button
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F9FAFB', border: 'none' }}
              onClick={() => setSkip(Math.max(0, skip - limit))}
              disabled={skip === 0}
            >
              <i className="bi bi-chevron-left" style={{ fontSize: '12px', color: '#374151' }}></i>
            </button>
            <div className="px-3 d-flex align-items-center rounded-2" style={{ backgroundColor: '#F9FAFB' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{currentPage} <span style={{ color: '#9CA3AF', fontWeight: 400, margin: '0 4px' }}>/</span> {totalPages}</span>
            </div>
            <button
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F9FAFB', border: 'none' }}
              onClick={() => setSkip(skip + limit)}
              disabled={skip + limit >= totalRecords}
            >
              <i className="bi bi-chevron-right" style={{ fontSize: '12px', color: '#374151' }}></i>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    contacted: 'primary',
    converted: 'success',
    pending: 'warning',
    closed: 'secondary',
    open: 'info',
    resolved: 'success',
    new: 'primary'
  };
  return colors[status?.toLowerCase()] || 'secondary';
}

function getSentimentColor(sentiment) {
  const colors = {
    satisfied: 'success',
    positive: 'success',
    neutral: 'secondary',
    negative: 'danger',
    dissatisfied: 'danger'
  };
  return colors[sentiment?.toLowerCase()] || 'secondary';
}
