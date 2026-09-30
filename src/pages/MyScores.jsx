import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMyNominees } from '../hooks/useQueries';
import { useAuth } from '../context/AuthProvider';
import { normalizeRole } from '../util/roles';

export default function MyScores() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isExecutive = role === 'executive_jury';
  const targetRoute = isExecutive ? 'my-finalists' : 'my-nominees';

  const { data: nominees = [], isLoading } = useMyNominees();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Only show nominees that have been scored
  const scoredNominees = useMemo(() => nominees.filter((n) => n.myScore), [nominees]);

  // Unique categories derived from the scored nominees list
  const categories = useMemo(() => {
    const map = new Map();
    for (const n of scoredNominees) {
      const cat = n.categoryId;
      if (cat) {
        const id = cat._id || cat;
        if (!map.has(id)) map.set(id, { id, name: cat.name || '—' });
      }
    }
    return Array.from(map.values());
  }, [scoredNominees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoredNominees.filter((n) => {
      const matchesSearch = !q || n.name.toLowerCase().includes(q);
      const catId = n.categoryId?._id || n.categoryId;
      const matchesCategory = !categoryFilter || catId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [scoredNominees, search, categoryFilter]);

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
              <h6 className="clt-title">My Scores</h6>
              <p className="clt-subtitle">
                {isExecutive ? 'Your Executive Jury scoring submissions' : 'Your Creator Jury scoring submissions'} · {scoredNominees.length} scored
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Category: All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
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
                    <th className="clt-th text-center">Total Score</th>
                    <th className="clt-th text-center">Status</th>
                    <th className="clt-th text-center pe-4">View</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading your scores…</p>
                      </td>
                    </tr>
                  ) : !filtered.length ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                        <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                          {scoredNominees.length
                            ? 'No submitted scores match your filters'
                            : "You haven't scored any nominees yet"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr
                        key={item._id}
                        className="clt-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/dashboard/${targetRoute}/${item._id}`)}
                      >
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="clt-avatar" style={{ overflow: 'hidden' }}>
                              {item.profileImage ? (
                                <img src={item.profileImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                item.name?.charAt(0).toUpperCase() || '?'
                              )}
                            </div>
                            <div className="clt-name">{item.name}</div>
                          </div>
                        </td>
                        <td className="text-center clt-cell">{item.categoryId?.name || '—'}</td>
                        <td className="text-center clt-cell">
                          <span style={{ fontWeight: 700, color: '#5006ba', fontSize: '15px' }}>
                            {Math.round(item.myScore?.avgScore ?? 0)}
                            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>/100</span>
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                            <i className="bi bi-check-circle me-1"></i>Submitted
                          </span>
                        </td>
                        <td className="pe-4 text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            style={{
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '4px 12px',
                              borderColor: '#5006ba',
                              color: '#5006ba',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/${targetRoute}/${item._id}`);
                            }}
                          >
                            <i className="bi bi-eye"></i>
                            <span>View</span>
                          </button>
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
