import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { updateCategory } from '../util/api';
import TablePagination from './TablePagination';

export default function CategoryTable({ categories, onDelete, onUpdate, isLoading }) {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit state
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const filteredCategories = useMemo(() => {
    const search = searchInput.trim().toLowerCase();
    return categories.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search);
      return matchesSearch;
    });
  }, [categories, searchInput]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, page, pageSize]);

  const clearFilters = () => {
    setSearchInput('');
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditError(null);
  };

  const handleCloseEdit = () => {
    if (isSaving) return;
    setEditingCategory(null);
    setEditName('');
    setEditError(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Category name is required');
      return;
    }

    if (trimmed === editingCategory.name) {
      handleCloseEdit();
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      if (onUpdate) {
        await onUpdate(editingCategory._id, { name: trimmed });
      } else {
        await updateCategory(editingCategory._id, { name: trimmed });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
      handleCloseEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card clt-card" style={{marginTop:'24px'}}>
      <div className="clt-header">
        <div>
          <h6 className="clt-title">Categories</h6>
          <p className="clt-subtitle">Manage award categories for your season</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="clt-search-wrap">
            <i className="bi bi-search clt-search-icon" />
            <input
              className="clt-search-input"
              type="text"
              placeholder="Search category…"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
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
                paginatedCategories.map((item) => (
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
                          onClick={() => handleStartEdit(item)}
                          title="Edit category"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
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

      {!isLoading && filteredCategories.length > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filteredCategories.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div
            className="cat-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050,
              padding: '1rem',
            }}
            onClick={handleCloseEdit}
          >
            <motion.div
              className="card cat-form-card"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: '100%', maxWidth: '480px', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="cat-form-title mb-0">Edit Category</h6>
                <button
                  type="button"
                  className="clt-action-btn"
                  onClick={handleCloseEdit}
                  title="Close"
                  disabled={isSaving}
                  style={{ width: '32px', height: '32px' }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <p className="cat-form-subtitle mb-3">
                Update the award category name for <strong>Season {editingCategory.season}</strong>
              </p>

              {editError && (
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '13px', borderRadius: '8px' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit}>
                <div className="cat-form-field mb-4">
                  <label className="cat-form-label" htmlFor="edit-category-name">
                    Category Name
                  </label>
                  <input
                    id="edit-category-name"
                    className="cat-form-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter category name"
                    autoFocus
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="clt-reset-btn"
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cat-form-submit"
                    disabled={isSaving || !editName.trim()}
                    style={{ minWidth: '120px' }}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2 me-1"></i> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
