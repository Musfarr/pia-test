import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthProvider';
import { useCategories, useCategoryAdmins, useCreateCategoryAdmin, useDeleteCategoryAdmin } from '../hooks/useQueries';
import { createCategory, deleteCategory } from '../util/api';
import CategoryTable from '../components/CategoryTable';

export default function Categories() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories();
  const { data: admins = [], isLoading: adminsLoading } = useCategoryAdmins();
  const createAdminMut = useCreateCategoryAdmin();
  const deleteAdminMut = useDeleteCategoryAdmin();

  // Category form
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Category Admin form
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createCategory({ name: name.trim() });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) return;

    setAdminSubmitting(true);
    try {
      await createAdminMut.mutateAsync({
        username: adminUsername.trim(),
        password: adminPassword.trim(),
        name: adminName.trim() || adminUsername.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ['category-admins'] });
      closeAdminModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category admin');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Delete this category admin account?')) return;
    try {
      await deleteAdminMut.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ['category-admins'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category admin');
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setAdminName('');
    setAdminUsername('');
    setAdminPassword('');
    setShowAdminPassword(false);
  };

  return (
    <div className="container-fluid px-3">

      <div className="row  gx-4 ">
        {/* Create Category — just the name */}
        <div className="col-12 col-lg-7">
          <motion.div
            className="card cat-form-card mb-4 h-100"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <h6 className="cat-form-title">Create Category</h6>
            <p className="cat-form-subtitle">
              Add a new award category for <strong>{user?.season || 'your season'}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="d-flex gap-3 flex-wrap align-items-end mt-3">
                <div className="cat-form-field" style={{ flex: '1 1 300px' }}>
                  <label className="cat-form-label" htmlFor="category-name">Category Name</label>
                  <input
                    id="category-name"
                    className="cat-form-input"
                    type="text"
                    placeholder="e.g. Best Actor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="cat-form-submit" disabled={submitting}>
                  {submitting ? 'Adding...' : (<><i className="bi bi-plus-lg"></i> Add Category</>)}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Create Category Admin — opens a modal */}
        <div className="col-12 col-lg-5">
          <motion.div
            className="card cat-form-card h-100 d-flex flex-column align-items-start justify-content-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <h6 className="cat-form-title">Category Admins</h6>
            <p className="cat-form-subtitle">
              Manage admins who can manage all categories in <strong>{user?.season || 'your season'}</strong>
            </p>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="cat-form-submit"
                onClick={() => setShowAdminModal(true)}
              >
                <i className="bi bi-person-plus"></i> Create Admin
              </button>
              {/* {admins.length > 0 && (
                <button
                  type="button"
                  className="cat-form-submit"
                  style={{ background: '#6B7280' }}
                  onClick={() => setShowAdminModal(true)}
                >
                  <i className="bi bi-people"></i> View Admins ({admins.length})
                </button>
              )} */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Admin Modal */}
      <AnimatePresence>
        {showAdminModal && (
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
            onClick={closeAdminModal}
          >
            <motion.div
              className="card cat-form-card"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="cat-form-title mb-0">Category Admins</h6>
              <button
                type="button"
                className="clt-action-btn"
                onClick={closeAdminModal}
                title="Close"
                style={{ width: '32px', height: '32px' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <p className="cat-form-subtitle">
              Add an admin who can manage all categories in <strong>{user?.season || 'your season'}</strong>
            </p>

            <form onSubmit={handleCreateAdmin}>
              <div className="d-flex flex-row gap-3 mt-3 flex-wrap">
                <div className="cat-form-field" style={{ flex: '1 1 200px' }}>
                  <label className="cat-form-label" htmlFor="admin-username">Username</label>
                  <input
                    id="admin-username"
                    className="cat-form-input"
                    type="text"
                    placeholder="e.g. john.admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="cat-form-field" style={{ flex: '1 1 200px' }}>
                  <label className="cat-form-label" htmlFor="admin-password">Password</label>
                  <div className="cat-form-password-wrap">
                    <input
                      id="admin-password"
                      className="cat-form-input"
                      type={showAdminPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="cat-form-password-toggle"
                      onClick={() => setShowAdminPassword((p) => !p)}
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi bi-${showAdminPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex mt-4">
                <button type="submit" className="cat-form-submit" disabled={adminSubmitting} style={{ width: '100%' }}>
                  {adminSubmitting ? 'Creating...' : (<><i className="bi bi-person-plus"></i> Create Admin</>)}
                </button>
              </div>
            </form>

            {/* Existing category admins list */}
            <div className="mt-4 pt-3 border-top">
              <span className="cat-form-label d-block mb-2">
                Existing Category Admins ({admins.length})
              </span>
              {admins.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '13px' }}>No admins yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {admins.map((admin) => (
                    <div key={admin._id} className="d-flex align-items-center justify-content-between" style={{ fontSize: '13px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="clt-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                          {(admin.name || admin.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{admin.name || admin.email}</div>
                          <div style={{ color: '#9CA3AF', fontSize: '11px' }}>{admin.email}</div>
                        </div>
                      </div>
                      <button
                        className="clt-action-btn"
                        onClick={() => handleDeleteAdmin(admin._id)}
                        title="Delete admin"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <i className="bi bi-trash3" style={{ fontSize: '12px' }}></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Categories table */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        className='mt-8 pt-8'
      >
        <CategoryTable categories={categories} onDelete={handleDelete} isLoading={isLoading} />
      </motion.div>

    </div>
  );
}
