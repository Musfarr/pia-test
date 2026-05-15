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
    <div className="card clt-card">
      <div className="clt-header">
        <div>
          <h6 className="clt-title">Recent Inquiries</h6>
          <p className="clt-subtitle">Manage and track all customer communications</p>
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="clt-tab-group">
            <button
              type="button"
              className={`clt-tab ${!isOrphanTab ? 'active' : ''}`}
              onClick={() => handleTabChange('user')}
              disabled={isControlsDisabled}
            >
              User Inquiries <span className="clt-tab-count">{total || 0}</span>
            </button>
            <button
              type="button"
              className={`clt-tab ${isOrphanTab ? 'active' : ''}`}
              onClick={() => handleTabChange('orphan')}
              disabled={isControlsDisabled}
            >
              Orphan Calls <span className="clt-tab-count">{total_orphan_calls || 0}</span>
            </button>
          </div>
          {!isOrphanTab && (
            <>
              <select className="date-filter-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} disabled={isControlsDisabled}>
                <option value="">Status: All</option>
                {(filterOptions?.statuses || []).map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              <select className="date-filter-select" value={filters.city_name} onChange={(e) => handleFilterChange('city_name', e.target.value)} disabled={isControlsDisabled}>
                <option value="">City: All</option>
                {(filterOptions?.cities || []).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button className="clt-reset-btn" onClick={clearFilters} disabled={isControlsDisabled}>
                <i className="bi bi-x-circle"></i> Reset
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="clt-thead-row">
                {isOrphanTab ? (
                  <>
                    <th className="clt-th ps-4">Caller Info</th>
                    <th className="clt-th text-center">Duration</th>
                    <th className="clt-th text-center">Sentiment</th>
                    <th className="clt-th text-center">Date & Time</th>
                    <th className="clt-th text-center pe-4">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="clt-th ps-4">Customer Info</th>
                    <th className="clt-th text-center">Location</th>
                    <th className="clt-th text-center">Status</th>
                    <th className="clt-th text-center">Date & Time</th>
                    <th className="clt-th text-center pe-4">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="border-top-0">
              {isAnyLoading && !displayedRecords?.length ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm me-2" style={{ color: '#173C7C' }} />
                    <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading records...</span>
                  </td>
                </tr>
              ) : !displayedRecords?.length ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                    <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No results found for your filters</p>
                  </td>
                </tr>
              ) : (
                displayedRecords.map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    <tr
                      className={`clt-row ${expandedRow === item.id ? 'clt-row--expanded' : ''}`}
                      onClick={() => (item.recording_text || item.summary) && toggleTranscript(item.id)}
                    >
                      {isOrphanTab ? (
                        <>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="clt-avatar">{(item.caller_num || 'O').toString().charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="clt-name">{item.caller_num || 'Unknown Caller'}</div>
                                <div className="clt-sub">Orphan Call</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center clt-cell">{item.call_duration || '--'}</td>
                          <td className="text-center">
                            <span className="clt-badge" style={getSentimentStyle(item.customer_sentiment)}>{item.customer_sentiment || 'Unknown'}</span>
                          </td>
                          <td className="text-center clt-cell">{item.created_at || '--'}</td>
                          <td className="pe-4 text-center">
                            <div className="d-flex gap-2 justify-content-center" onClick={e => e.stopPropagation()}>
                              {(item.recording_text || item.summary) && (
                                <button className={`clt-action-btn ${expandedRow === item.id ? 'active' : ''}`} onClick={() => toggleTranscript(item.id)}>
                                  <i className={`bi bi-chat-text${expandedRow === item.id ? '-fill' : ''}`}></i>
                                </button>
                              )}
                              {item.recording_url && (
                                <a href={item.recording_url.replace('http://', 'https://')} target="_blank" rel="noopener noreferrer" className="clt-action-btn">
                                  <i className="bi bi-play-fill"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="clt-avatar">{(item.name || 'U').charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="clt-name">{item.name || 'Unknown User'}</div>
                                <div className="clt-sub">{item.email || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center clt-cell">{item.city_name || item.city || '--'}</td>
                          <td className="text-center">
                            <span className="clt-badge" style={getStatusStyle(item.status)}>{item.status || 'N/A'}</span>
                          </td>
                          <td className="text-center clt-cell">
                            {item.created_at ? new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
                          </td>
                          <td className="pe-4 text-center">
                            <div className="d-flex gap-2 justify-content-center" onClick={e => e.stopPropagation()}>
                              {(item.recording_text || item.summary) && (
                                <button className={`clt-action-btn ${expandedRow === item.id ? 'active' : ''}`} onClick={() => toggleTranscript(item.id)}>
                                  <i className={`bi bi-chat-text${expandedRow === item.id ? '-fill' : ''}`}></i>
                                </button>
                              )}
                              {item.recordings && (
                                <a href={item.recordings.replace('http://', 'https://')} target="_blank" rel="noopener noreferrer" className="clt-action-btn">
                                  <i className="bi bi-play-fill"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <td colSpan="5" className="p-0 border-0">
                        <div className={`expandable-wrapper ${expandedRow === item.id ? 'expanded' : ''}`}>
                          <div className="expandable-content">
                            {(item.recording_text || item.summary) && (
                              <div className="clt-expand-card">
                                <div className="row g-4">
                                  {item.recording_text && (
                                    <div className={item.summary ? 'col-lg-7' : 'col-12'} style={item.summary ? { borderRight: '1px solid #F3F4F6' } : {}}>
                                      <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="clt-icon-box"><i className="bi bi-chat-left-dots"></i></div>
                                        <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px', color: '#111827' }}>Live Transcript</h6>
                                      </div>
                                      <div className="clt-chat-scroll">
                                        {item.recording_text.split('\n').map((line, i) => {
                                          const isAgent = line.toLowerCase().startsWith('agent:');
                                          const content = line.replace(/^(Agent:|Caller:)\s*/i, '');
                                          if (!content) return null;
                                          return (
                                            <div key={i} className={`mb-3 d-flex ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                                              <div className={`clt-bubble ${isAgent ? 'clt-bubble--agent' : 'clt-bubble--caller'}`}>
                                                <div className="clt-bubble-label">{isAgent ? 'AI Agent' : 'Customer'}</div>
                                                {content}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {item.summary && (
                                    <div className={item.recording_text ? 'col-lg-5' : 'col-12'}>
                                      <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="clt-icon-box clt-icon-box--amber"><i className="bi bi-magic"></i></div>
                                        <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px', color: '#111827' }}>AI Insight Summary</h6>
                                      </div>
                                      <div className="clt-summary-box">
                                        <p className="mb-0" style={{ fontSize: '13px', lineHeight: '1.7', color: '#374151' }}>{item.summary}</p>
                                      </div>
                                      {item.customer_sentiment && (
                                        <div className="clt-sentiment-row">
                                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Detected Sentiment</span>
                                          <span className="clt-badge" style={getSentimentStyle(item.customer_sentiment)}>{item.customer_sentiment}</span>
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

      <div className="clt-footer">
        <span className="clt-cell">
          Showing <strong style={{ color: '#111827' }}>{skip + 1}</strong>–<strong style={{ color: '#111827' }}>{Math.min(skip + limit, totalRecords || 0)}</strong> of <strong style={{ color: '#111827' }}>{totalRecords || 0}</strong>
        </span>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="clt-cell">Per page:</span>
            <select className="date-filter-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))} disabled={isControlsDisabled}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="clt-page-btn" onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0}>
              <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
            </button>
            <span className="clt-page-indicator">{currentPage} <span style={{ color: '#D1D5DB', margin: '0 2px' }}>/</span> {totalPages}</span>
            <button className="clt-page-btn" onClick={() => setSkip(skip + limit)} disabled={skip + limit >= totalRecords}>
              <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  const styles = {
    new:         { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
    in_progress: { backgroundColor: '#FEF3C7', color: '#D97706' },
    closed:      { backgroundColor: '#F3F4F6', color: '#6B7280' },
    resolved:    { backgroundColor: '#D1FAE5', color: '#059669' },
    contacted:   { backgroundColor: '#EDE9FE', color: '#7C3AED' },
    converted:   { backgroundColor: '#D1FAE5', color: '#059669' },
    pending:     { backgroundColor: '#FEF3C7', color: '#D97706' },
    open:        { backgroundColor: '#DBEAFE', color: '#3B82F6' },
  };
  return styles[status?.toLowerCase()] || { backgroundColor: '#F3F4F6', color: '#6B7280' };
}

function getSentimentStyle(sentiment) {
  const styles = {
    positive:     { backgroundColor: '#D1FAE5', color: '#059669' },
    satisfied:    { backgroundColor: '#D1FAE5', color: '#059669' },
    neutral:      { backgroundColor: '#F3F4F6', color: '#6B7280' },
    negative:     { backgroundColor: '#FEE2E2', color: '#DC2626' },
    dissatisfied: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  };
  return styles[sentiment?.toLowerCase()] || { backgroundColor: '#F3F4F6', color: '#6B7280' };
}
