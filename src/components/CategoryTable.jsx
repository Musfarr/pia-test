import React, { useMemo, useState } from 'react';
import { seasonOptions } from '../data/dashboardData';

export default function CategoryTable({ categories, onDelete, isLoading }) {
  const [searchInput, setSearchInput] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');

  const filteredCategories = useMemo(() => {
    const search = searchInput.trim().toLowerCase();
    return categories.filter((item) => {
      const matchesSeason = !seasonFilter || item.season === seasonFilter;
      const matchesSearch = !search || item.name.toLowerCase().includes(search);
      return matchesSeason && matchesSearch;
    });
  }, [categories, searchInput, seasonFilter]);

  const clearFilters = () => {
    setSearchInput('');
    setSeasonFilter('');
  };

  return (
    <div className="card clt-card">
      <div className="clt-header">
        <div>
          <h6 className="clt-title">Categories</h6>
          <p className="clt-subtitle">Manage all award categories across seasons</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="clt-search-wrap">
            <i className="bi bi-search clt-search-icon" />
            <input
              className="clt-search-input"
              type="text"
              placeholder="Search category…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className="date-filter-select"
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
          >
            <option value="">Season: All</option>
            {seasonOptions.map((season) => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
          <button className="clt-reset-btn" onClick={clearFilters}>
            <i className="bi bi-x-circle"></i> Reset
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="clt-thead-row">
                <th className="clt-th ps-4">Category Name</th>
                <th className="clt-th text-center">Season</th>
                <th className="clt-th text-center">Created</th>
                <th className="clt-th text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading categories…</p>
                  </td>
                </tr>
              ) : !filteredCategories.length ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                    <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No categories found</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item) => (
                  <tr key={item._id} className="clt-row">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="clt-avatar">{item.name.charAt(0).toUpperCase()}</div>
                        <div className="clt-name">{item.name}</div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="clt-badge" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>{item.season}</span>
                    </td>
                    <td className="text-center clt-cell">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                    <td className="pe-4 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="clt-action-btn"
                          onClick={() => onDelete(item._id)}
                          title="Delete category"
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
