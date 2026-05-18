import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../services/api';

export default function CallLogTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [playingRow, setPlayingRow] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ channel: '', search: '', start_date: '', end_date: '' });
  const searchTimerRef = useRef(null);
  const [searchInput, setSearchInput] = useState('');

  const queryParams = useMemo(() => ({ ...filters, page, limit }), [filters, page, limit]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['conversations', queryParams],
    queryFn: () => getConversations(queryParams),
  });

  const records = response?.data?.conversations ?? [];
  const pagination = response?.data?.pagination ?? {};
  const totalRecords = pagination.total ?? 0;
  const totalPages = pagination.total_pages ?? 1;

  useEffect(() => {
    setPage(1);
    setExpandedRow(null);
    setPlayingRow(null);
  }, [filters, limit]);

  const toggleTranscript = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    if (playingRow === id) setPlayingRow(null);
  };

  const toggleAudio = (id) => {
    setPlayingRow(playingRow === id ? null : id);
    if (expandedRow !== id) setExpandedRow(id);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: val }));
    }, 400);
  };

  const clearFilters = () => {
    setFilters({ channel: '', search: '', start_date: '', end_date: '' });
    setSearchInput('');
  };

  const showFrom = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const showTo = Math.min(page * limit, totalRecords);

  return (
    <div className="card clt-card">
      <div className="clt-header">
        <div>
          <h6 className="clt-title">Recent Conversations</h6>
          <p className="clt-subtitle">Manage and track all customer communications</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="clt-search-wrap">
            <i className="bi bi-search clt-search-icon" />
            <input
              className="clt-search-input"
              type="text"
              placeholder="Search by customer, summary…"
              value={searchInput}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
          </div>
          <select className="date-filter-select" value={filters.channel} onChange={(e) => handleFilterChange('channel', e.target.value)} disabled={isLoading}>
            <option value="">Channel: All</option>
            <option value="web">Web</option>
            {/* <option value="webrtc">WebRTC</option> */}
            <option value="gsm">GSM</option>
            {/* <option value="voice">Voice</option> */}
          </select>
          <input type="date" className="date-filter-select" value={filters.start_date} onChange={(e) => handleFilterChange('start_date', e.target.value)} disabled={isLoading} style={{ cursor: 'pointer' }} />
          <input type="date" className="date-filter-select" value={filters.end_date} onChange={(e) => handleFilterChange('end_date', e.target.value)} disabled={isLoading} style={{ cursor: 'pointer' }} />
          <button className="clt-reset-btn" onClick={clearFilters} disabled={isLoading}>
            <i className="bi bi-x-circle"></i> Reset
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="clt-thead-row">
                <th className="clt-th ps-4">Customer</th>
                <th className="clt-th text-center">Channel</th>
                <th className="clt-th text-center">Intent</th>
                <th className="clt-th text-center">Sentiment</th>
                <th className="clt-th text-center">Duration</th>
                <th className="clt-th text-center">Time</th>
                <th className="clt-th text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {isLoading && !records.length ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm me-2" style={{ color: '#173C7C' }} />
                    <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading records...</span>
                  </td>
                </tr>
              ) : !records.length ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                    <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No results found</p>
                  </td>
                </tr>
              ) : (
                records.map((item, index) => (
                  <React.Fragment key={item.id ?? index}>
                    <tr
                      className={`clt-row ${expandedRow === item.id ? 'clt-row--expanded' : ''}`}
                      onClick={() => (item.recording_text || item.summary) && toggleTranscript(item.id)}
                    >
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="clt-avatar">{(item.customer || 'U').toString().charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="clt-name">{item.customer || 'Unknown'}</div>
                            <div className="clt-sub">{item.handled_by || '--'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="clt-badge" style={getChannelStyle(item.channel)}>{item.channel_label || item.channel || '--'}</span>
                      </td>
                      <td className="text-center clt-cell" style={{ fontSize: '13px' }}>{item.intent || '--'}</td>
                      <td className="text-center">
                        <span className="clt-badge" style={getSentimentStyle(item.sentiment)}>{item.sentiment || '--'}</span>
                      </td>
                      <td className="text-center clt-cell">{item.duration ? `${item.duration}s` : '--'}</td>
                      <td className="text-center clt-cell">{item.time || '--'}</td>
                      <td className="pe-4 text-center">
                        <div className="d-flex gap-2 justify-content-center" onClick={e => e.stopPropagation()}>
                          {(item.recording_text || item.summary) && (
                            <button className={`clt-action-btn ${expandedRow === item.id ? 'active' : ''}`} onClick={() => toggleTranscript(item.id)} title="View transcript">
                              <i className={`bi bi-chat-text${expandedRow === item.id ? '-fill' : ''}`}></i>
                            </button>
                          )}
                          {item.recording_url && (
                            <button className={`clt-action-btn ${playingRow === item.id ? 'active' : ''}`} onClick={() => toggleAudio(item.id)} title="Play recording">
                              <i className={`bi bi-${playingRow === item.id ? 'pause-fill' : 'play-fill'}`}></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="p-0 border-0">
                        <div className={`expandable-wrapper ${expandedRow === item.id ? 'expanded' : ''}`}>
                          <div className="expandable-content">
                            {(item.recording_text || item.summary || item.recording_url) && (
                              <div className="clt-expand-card">
                                {item.recording_url && (
                                  <div className="mb-4">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <div className="clt-icon-box" style={{ background: '#EFF6FF' }}><i className="bi bi-headphones" style={{ color: '#3B82F6' }}></i></div>
                                      <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px', color: '#111827' }}>Call Recording</h6>
                                    </div>
                                    <audio
                                      controls
                                      autoPlay={playingRow === item.id}
                                      onEnded={() => setPlayingRow(null)}
                                      style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                                      src={item.recording_url}
                                    />
                                  </div>
                                )}
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
                                          if (!content.trim()) return null;
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
                                      {item.sentiment && (
                                        <div className="clt-sentiment-row">
                                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Detected Sentiment</span>
                                          <span className="clt-badge" style={getSentimentStyle(item.sentiment)}>{item.sentiment}</span>
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
          Showing <strong style={{ color: '#111827' }}>{showFrom}</strong>–<strong style={{ color: '#111827' }}>{showTo}</strong> of <strong style={{ color: '#111827' }}>{totalRecords}</strong>
        </span>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="clt-cell">Per page:</span>
            <select className="date-filter-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))} disabled={isLoading}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="clt-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
            </button>
            <span className="clt-page-indicator">{page} <span style={{ color: '#D1D5DB', margin: '0 2px' }}>/</span> {totalPages}</span>
            <button className="clt-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
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

function getChannelStyle(channel) {
  const styles = {
    gsm:    { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
    webrtc: { backgroundColor: '#EDE9FE', color: '#7C3AED' },
    web:    { backgroundColor: '#D1FAE5', color: '#059669' },
    voice:  { backgroundColor: '#FEF3C7', color: '#D97706' },
  };
  return styles[channel?.toLowerCase()] || { backgroundColor: '#F3F4F6', color: '#6B7280' };
}

function getSentimentStyle(sentiment) {
  const styles = {
    positive:   { backgroundColor: '#D1FAE5', color: '#059669' },
    satisfied:  { backgroundColor: '#D1FAE5', color: '#059669' },
    neutral:    { backgroundColor: '#F3F4F6', color: '#6B7280' },
    negative:   { backgroundColor: '#FEE2E2', color: '#DC2626' },
    frustrated: { backgroundColor: '#FEE2E2', color: '#DC2626' },
    confused:   { backgroundColor: '#FEF3C7', color: '#D97706' },
    angry:      { backgroundColor: '#FEE2E2', color: '#DC2626' },
    happy:      { backgroundColor: '#D1FAE5', color: '#059669' },
  };
  return styles[sentiment?.toLowerCase()] || { backgroundColor: '#F3F4F6', color: '#6B7280' };
}
