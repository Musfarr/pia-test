import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCategories, useSettings } from '../hooks/useQueries';

const STAGE_LABELS = {
  setup: { label: 'Setup', color: '#6B7280', icon: 'bi-gear' },
  creator_rating: { label: 'Creator Jury Rating', color: '#5006ba', icon: 'bi-pencil-square' },
  executive_rating: { label: 'Executive Jury Rating', color: '#D97706', icon: 'bi-award' },
  public_voting: { label: 'Public Voting', color: '#059669', icon: 'bi-people' },
  completed: { label: 'Completed', color: '#2563EB', icon: 'bi-check-circle' },
};

export default function MyCategories() {
  const { data: categories = [], isLoading, isError, error } = useCategories();
  const { data: settings } = useSettings();
  const currentStage = settings?.currentStage || 'setup';
  const stageInfo = STAGE_LABELS[currentStage] || STAGE_LABELS.setup;

  if (isLoading) {
    return (
      <div className="container-fluid px-3">
        <div className="text-center py-5">
          <output className="spinner-border text-primary"></output>
          <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading categories…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-fluid px-3">
        <motion.div
          className="card cat-form-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="text-center py-4">
            <i className="bi bi-exclamation-circle" style={{ fontSize: '2.5rem', color: '#DC2626', display: 'block', marginBottom: '8px' }}></i>
            <p className="mb-0" style={{ color: '#6B7280', fontSize: '14px' }}>
              {error?.response?.data?.message || 'Failed to load categories.'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="container-fluid px-3">
        <motion.div
          className="card cat-form-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="text-center py-4">
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
            <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>No categories have been created for your season yet.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3">

      {/* Global stage banner — read-only for category admin */}
      <motion.div
        className="card cat-form-card mb-3"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${stageInfo.color}15`, color: stageInfo.color, fontSize: '18px',
            }}
          >
            <i className={`bi ${stageInfo.icon}`}></i>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Platform Stage
            </span>
            <h6 className="mb-0" style={{ fontSize: '15px', fontWeight: 700, color: stageInfo.color }}>
              {stageInfo.label}
            </h6>
          </div>
        </div>
      </motion.div>

      {/* Category cards */}
      <div className="row g-3">
        {categories.map((category, i) => (
          <div key={category._id} className="col-12 col-md-6">
            <motion.div
              className="card cat-form-card h-100"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="clt-avatar">{category.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h6 className="cat-form-title mb-0">{category.name}</h6>
                    {category.season && (
                      <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '11px' }}>
                        Season {category.season}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to="/dashboard/nominees"
                  className="btn btn-sm btn-outline-secondary"
                  style={{ borderRadius: '8px', fontSize: '13px' }}
                >
                  <i className="bi bi-person-badge me-1"></i>Nominees
                </Link>
              </div>

              {/* Global stage badge (read-only) */}
              <div className="pt-3 border-top">
                <span className="cat-form-label d-block mb-2" style={{ fontSize: '12px' }}>Platform Stage</span>
                <span className="clt-badge" style={{ backgroundColor: `${stageInfo.color}15`, color: stageInfo.color }}>
                  <i className={`bi ${stageInfo.icon} me-1`}></i>{stageInfo.label}
                </span>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

    </div>
  );
}
