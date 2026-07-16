import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { juryTypes } from '../data/dashboardData';
import { useCategories } from '../hooks/useQueries';
import CategoryMultiSelect from './CategoryMultiSelect';

export default function JuryTable({ juries, onDelete, onAssignCategory, viewAllHref, isLoading }) {
  const { data: categories = [] } = useCategories();
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredJuries = useMemo(() => {
    const search = searchInput.trim().toLowerCase();
    return juries.filter((item) => {
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesSearch = !search || item.name.toLowerCase().includes(search) || item.username.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  }, [juries, searchInput, typeFilter]);

  const clearFilters = () => {
    setSearchInput('');
    setTypeFilter('');
  };

  return (
    <div className="card clt-card">
      <div className="clt-header">
        <div>
          <h6 className="clt-title">Jurors</h6>
          <p className="clt-subtitle">Manage jury members and their category assignments</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="clt-search-wrap">
            <i className="bi bi-search clt-search-icon" />
            <input
              className="clt-search-input"
              type="text"
              placeholder="Search by name, username…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className="date-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Type: All</option>
            {juryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button className="clt-reset-btn" onClick={clearFilters}>
            <i className="bi bi-x-circle"></i> Reset
          </button>
          {viewAllHref && (
            <Link to={viewAllHref} className="clt-reset-btn">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          )}
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="clt-thead-row">
                <th className="clt-th ps-4">Jury Member</th>
                <th className="clt-th text-center">Type</th>
                <th className="clt-th text-center">Username</th>
                <th className="clt-th text-center">Assigned Categories</th>
                <th className="clt-th text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading jury members…</p>
                  </td>
                </tr>
              ) : !filteredJuries.length ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                    <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No jury members found</p>
                  </td>
                </tr>
              ) : (
                filteredJuries.map((item) => (
                  <tr key={item._id} className="clt-row">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="clt-avatar" style={{ overflow: 'hidden' }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            item.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="clt-name">{item.name}</div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className="clt-badge"
                        style={item.type === 'Creator'
                          ? { backgroundColor: '#D1FAE5', color: '#059669' }
                          : { backgroundColor: '#EEF4FF', color: '#5006ba' }}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="text-center clt-cell">{item.username}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center">
                        <CategoryMultiSelect
                          categories={categories}
                          selected={item.categories || []}
                          onToggle={(catName) => onAssignCategory(item._id, catName)}
                        />
                      </div>
                    </td>
                    <td className="pe-4 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="clt-action-btn"
                          onClick={() => onDelete(item._id)}
                          title="Delete jury member"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
