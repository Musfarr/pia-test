import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { categories as initialCategories, seasonOptions } from '../data/dashboardData';
import CategoryTable from '../components/CategoryTable';

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !season) return;

    const newCategory = {
      id: Date.now(),
      name: name.trim(),
      season,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    setCategories((prev) => [newCategory, ...prev]);
    setName('');
    setSeason('');
  };

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
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

            <button type="submit" className="cat-form-submit">
              <i className="bi bi-plus-lg"></i> Add Category
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <CategoryTable categories={categories} onDelete={handleDelete} />
      </motion.div>

    </div>
  );
}
