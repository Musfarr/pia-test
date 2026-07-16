import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMyNominees } from '../hooks/useQueries';

export default function MyNominees() {
  const { data: nominees = [], isLoading } = useMyNominees();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return nominees.filter((n) => {
      const matchesSearch = !q || n.name.toLowerCase().includes(q);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'submitted' && n.myScore) ||
        (statusFilter === 'pending' && !n.myScore);
      return matchesSearch && matchesStatus;
    });
  }, [nominees, search, statusFilter]);

  const submittedCount = nominees.filter((n) => n.myScore).length;

  return (
    <div className="container-fluid px-3">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="card clt-card">
          <div className="clt-header">
            <div>
              <h6 className="clt-title">My Nominees</h6>
              <p className="clt-subtitle">
                Nominees assigned to you for Creator Jury scoring · {submittedCount}/{nominees.length} scored
              </p>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="clt-search-wrap">
                <i className="bi bi-search clt-search-icon" />
                <input
                  className="clt-search-input"
                  type="text"
                  placeholder="Search nominee…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="date-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Status: All</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="clt-thead-row">
                    <th className="clt-th ps-4">Nominee</th>
                    <th className="clt-th text-center">Category</th>
                    <th className="clt-th text-center">Season</th>
                    <th className="clt-th text-center">My Score</th>
                    <th className="clt-th text-center">Status</th>
                    <th className="clt-th text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading your nominees…</p>
                      </td>
                    </tr>
                  ) : !filtered.length ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                        <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                          {nominees.length ? 'No nominees match your filters' : 'No nominees assigned to you yet'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item._id} className="clt-row">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="clt-avatar">{item.name.charAt(0).toUpperCase()}</div>
                            <div className="clt-name">{item.name}</div>
                          </div>
                        </td>
                        <td className="text-center clt-cell">{item.categoryId?.name || '—'}</td>
                        <td className="text-center">
                          <span className="clt-badge" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>
                            {item.season}
                          </span>
                        </td>
                        <td className="text-center clt-cell">
                          {item.myScore ? (
                            <span style={{ fontWeight: 700, color: '#5006ba' }}>{item.myScore.totalScore}</span>
                          ) : '—'}
                        </td>
                        <td className="text-center">
                          {item.myScore ? (
                            <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                              <i className="bi bi-check-circle me-1"></i>Submitted
                            </span>
                          ) : (
                            <span className="clt-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                              <i className="bi bi-clock me-1"></i>Pending
                            </span>
                          )}
                        </td>
                        <td className="pe-4 text-center">
                          <Link
                            to={`/dashboard/my-nominees/${item._id}`}
                            className="clt-action-btn"
                            title="Rate nominee"
                          >
                            <i className="bi bi-star"></i>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
