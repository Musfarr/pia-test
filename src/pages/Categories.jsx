import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthProvider';
import { useCategories } from '../hooks/useQueries';
import { createCategory, deleteCategory } from '../util/api';
import CategoryTable from '../components/CategoryTable';

export default function Categories() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories();
  const [name, setName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createCategory({
        name: name.trim(),
        adminUsername: adminUsername.trim(),
        adminPassword,
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setAdminUsername('');
      setAdminPassword('');
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

  return (
    <div className="container-fluid px-3">

      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <h6 className="cat-form-title">Create Category</h6>
        <p className="cat-form-subtitle">
          Add a new award category for <strong>{user?.season || 'your season'}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="cat-form-row">
            <div className="cat-form-field">
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

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="category-admin-username">Category Admin Username</label>
              <input
                id="category-admin-username"
                className="cat-form-input"
                type="text"
                placeholder="e.g. admin.bestactor"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
            </div>

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="category-admin-password">Category Admin Password</label>
              <div className="cat-form-password-wrap">
                <input
                  id="category-admin-password"
                  className="cat-form-input"
                  type={showAdminPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
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

            <button type="submit" className="cat-form-submit" disabled={submitting}>
              {submitting ? 'Adding...' : (<><i className="bi bi-plus-lg"></i> Add Category</>)}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <CategoryTable categories={categories} onDelete={handleDelete} isLoading={isLoading} />
      </motion.div>

    </div>
  );
}
