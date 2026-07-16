import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNomineeData } from '../hooks/useQueries';

// Read-only platform data viewer used by jury when scoring a nominee.
// Mirrors the platform tabs from NomineeProfile but with no edit controls.
const PLATFORMS = [
  { key: 'twitter', label: 'Twitter', icon: 'bi-twitter', followerLabel: 'Followers' },
  { key: 'youtube', label: 'YouTube', icon: 'bi-youtube', followerLabel: 'Subscribers' },
  { key: 'instagram', label: 'Instagram', icon: 'bi-instagram', followerLabel: 'Followers' },
  { key: 'tiktok', label: 'TikTok', icon: 'bi-tiktok', followerLabel: 'Followers' },
  { key: 'facebook', label: 'Facebook', icon: 'bi-facebook', followerLabel: 'Followers' },
];

const formatCount = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
};

export default function PlatformDataView({ nomineeId }) {
  const { data: nomineeData, isLoading } = useNomineeData(nomineeId);
  const [activeTab, setActiveTab] = useState('twitter');

  const activePlatform = PLATFORMS.find((p) => p.key === activeTab);
  const platformData = nomineeData?.[activeTab] || {};

  return (
    <motion.div
      className="card clt-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Tab bar */}
      <div className="d-flex flex-wrap gap-1 p-2 border-bottom">
        {PLATFORMS.map((p) => {
          const hasData = nomineeData?.[p.key]?.followers || nomineeData?.[p.key]?.image;
          return (
            <button
              key={p.key}
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-2 ${activeTab === p.key ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab(p.key)}
              style={{ borderRadius: '8px' }}
            >
              <i className={`bi ${p.icon}`}></i>
              {p.label}
              {hasData && <span className="badge bg-success ms-1" style={{ fontSize: '9px' }}>•</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content (read-only) */}
      <div className="card-body p-4">
        {isLoading ? (
          <div className="text-center py-4">
            <output className="spinner-border text-primary"></output>
            <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>
              Loading {activePlatform?.label} data…
            </p>
          </div>
        ) : (
          <div className="row g-4 align-items-center">
            {/* Image */}
            <div className="col-12 col-md-4">
              <div className="d-flex flex-column align-items-center gap-2">
                <div
                  className="clt-avatar"
                  style={{ width: '120px', height: '120px', overflow: 'hidden', borderRadius: '12px', fontSize: '40px' }}
                >
                  {platformData.image ? (
                    <img src={platformData.image} alt={activePlatform?.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className={`bi ${activePlatform?.icon}`} style={{ fontSize: '40px', color: '#9CA3AF' }}></i>
                  )}
                </div>
                <span className="cat-form-label" style={{ fontSize: '13px' }}>{activePlatform?.label}</span>
              </div>
            </div>

            {/* Followers stat */}
            <div className="col-12 col-md-8">
              <div className="cat-form-field">
                <label className="cat-form-label d-block mb-2">{activePlatform?.followerLabel}</label>
                <div
                  className="d-flex align-items-center gap-2"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    background: '#F9FAFB',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
                >
                  <i className={`bi ${activePlatform?.icon}`} style={{ color: '#5006ba' }}></i>
                  {platformData.followers ? formatCount(platformData.followers) : '—'}
                  {platformData.followers ? (
                    <span style={{ fontSize: '13px', fontWeight: 400, color: '#6B7280' }}>
                      ({Number(platformData.followers).toLocaleString()} total)
                    </span>
                  ) : null}
                </div>
              </div>

              {!platformData.followers && !platformData.image && (
                <p className="mb-0 mt-3" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  No {activePlatform?.label} data has been added for this nominee yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
