import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { seasonOptions } from '../data/dashboardData';
import { useCategories } from '../hooks/useQueries';
import { createCategory, deleteCategory } from '../util/api';
import CategoryTable from '../components/CategoryTable';

export default function Categories() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useCategories();
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !season) return;

    setSubmitting(true);
    try {
      await createCategory({ name: name.trim(), season });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setSeason('');
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
        <p className="cat-form-subtitle">Add a new award category and assign it to a season</p>

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
              <label className="cat-form-label" htmlFor="category-season">Season</label>
              <select
                id="category-season"
                className="cat-form-select"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                required
              >
                <option value="" disabled>Select season</option>
                {seasonOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
