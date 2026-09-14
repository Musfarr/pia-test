import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories, useNominees } from '../hooks/useQueries';
import { createNominee, deleteNominee } from '../util/api';
import CustomSelect from '../components/CustomSelect';
import TablePagination from '../components/TablePagination';

export default function Nominees() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: nominees = [], isLoading } = useNominees();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categoryFilterOptions = useMemo(() => [
    { value: '', label: 'Category: All' },
    ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
  ], [categories]);

  const filteredNominees = useMemo(() => {
    const search = searchInput.trim().toLowerCase();
    return nominees.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search);
      const matchesCategory = !categoryFilter || item.categoryId?._id === categoryFilter || item.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [nominees, searchInput, categoryFilter]);

  const paginatedNominees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredNominees.slice(start, start + pageSize);
  }, [filteredNominees, page, pageSize]);

  const clearFilters = () => {
    setSearchInput('');
    setCategoryFilter('');
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (val) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    setSubmitting(true);
    try {
      await createNominee({ name: name.trim(), categoryId });
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
      setName('');
      setCategoryId('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create nominee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this nominee and all associated platform data?')) return;
    try {
      await deleteNominee(id);
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete nominee');
    }
  };

  const getCategoryName = (item) => {
    if (typeof item.categoryId === 'object' && item.categoryId) return item.categoryId.name;
    return '—';
  };

  return (
    <div className="container-fluid px-3">

      {/* Create form */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <h6 className="cat-form-title">Add Nominee</h6>
        <p className="cat-form-subtitle">Create a nominee shell and link it to a category</p>

        <form onSubmit={handleSubmit}>
          <div className="cat-form-row">
            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="nominee-name">Nominee Name</label>
              <input
                id="nominee-name"
                className="cat-form-input"
                type="text"
                placeholder="e.g. Ayesha Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="nominee-category">Category</label>
              <select
                id="nominee-category"
                className="cat-form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={catLoading}
              >
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="cat-form-submit" disabled={submitting}>
              {submitting ? 'Adding...' : (<><i className="bi bi-plus-lg"></i> Add Nominee</>)}
            </button>
          </div>
        </form>
      </motion.div>

      {/* List table */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="card clt-card">
          <div className="clt-header">
            <div>
              <h6 className="clt-title">Nominees</h6>
              <p className="clt-subtitle">Manage nominee records across categories</p>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="clt-search-wrap">
                <i className="bi bi-search clt-search-icon" />
                <input
                  className="clt-search-input"
                  type="text"
                  placeholder="Search nominee…"
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>
              <CustomSelect
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                options={categoryFilterOptions}
                placeholder="Category: All"
                triggerStyle={{ minWidth: '180px' }}
              />
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
                    <th className="clt-th ps-4">Nominee</th>
                    <th className="clt-th text-center">Category</th>
                    <th className="clt-th text-center">Season</th>
                    <th className="clt-th text-center">Created</th>
                    <th className="clt-th text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading nominees…</p>
                      </td>
                    </tr>
                  ) : !filteredNominees.length ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                        <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No nominees found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedNominees.map((item) => (
                      <tr key={item._id} className="clt-row">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="clt-avatar" style={{ overflow: 'hidden' }}>
                            {item.profileImage ? (
                              <img src={item.profileImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              item.name.charAt(0).toUpperCase()
                            )}
                          </div>
                            <div className="clt-name">{item.name}</div>
                          </div>
                        </td>
                        <td className="text-center clt-cell">{getCategoryName(item)}</td>
                        <td className="text-center">
                          <span className="clt-badge" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>{item.season}</span>
                        </td>
                        <td className="text-center clt-cell">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                        <td className="pe-4 text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Link
                              to={`/dashboard/nominees/${item._id}`}
                              className="clt-action-btn"
                              title="Edit platform data"
                              style={{ textDecoration: 'none' }}
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              className="clt-action-btn"
                              onClick={() => handleDelete(item._id)}
                              title="Delete nominee"
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

          {!isLoading && filteredNominees.length > 0 && (
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={filteredNominees.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </motion.div>

    </div>
  );
}
