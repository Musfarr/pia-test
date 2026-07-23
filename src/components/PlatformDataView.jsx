import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNomineeData } from '../hooks/useQueries';

// Read-only platform data viewer used by jury when scoring a nominee.
// Only 3 platforms: Instagram, YouTube, TikTok.
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'bi-instagram', followerLabel: 'Followers' },
  { key: 'youtube', label: 'YouTube', icon: 'bi-youtube', followerLabel: 'Subscribers' },
  { key: 'tiktok', label: 'TikTok', icon: 'bi-tiktok', followerLabel: 'Followers' },
];

// Per-platform stat definitions for read-only display
const PLATFORM_STATS = {
  instagram: [
    { key: 'followers', label: 'Followers', format: 'count', icon: 'bi-people' },
    { key: 'followerGrowth', label: 'Follower Growth', format: 'percent', icon: 'bi-graph-up-arrow' },
    { key: 'er', label: 'ER', format: 'percent', icon: 'bi-heart-pulse' },
    { key: 'videoViews', label: 'Video Views', format: 'count', icon: 'bi-play-circle' },
    { key: 'postViews', label: 'Post Views', format: 'count', icon: 'bi-eye' },
    { key: 'audienceQuality', label: 'Audience Quality', format: 'percent', icon: 'bi-shield-check' },
    { key: 'audiencePakistan', label: 'Aud Based in Pakistan', format: 'percent', icon: 'bi-geo-alt' },
    { key: 'likersQuality', label: 'Likers Quality', format: 'percent', icon: 'bi-hand-thumbs-up' },
    { key: 'likersPakistan', label: 'Likers from Pakistan', format: 'percent', icon: 'bi-flag' },
  ],
  tiktok: [
    { key: 'followers', label: 'Followers', format: 'count', icon: 'bi-people' },
    { key: 'followerGrowth', label: 'Follower Growth', format: 'percent', icon: 'bi-graph-up-arrow' },
    { key: 'er', label: 'ER', format: 'percent', icon: 'bi-heart-pulse' },
    { key: 'videoViews', label: 'Video Views', format: 'count', icon: 'bi-play-circle' },
    { key: 'audienceQuality', label: 'Audience Quality', format: 'percent', icon: 'bi-shield-check' },
    { key: 'audiencePakistan', label: 'Aud Based in Pakistan', format: 'percent', icon: 'bi-geo-alt' },
  ],
  youtube: [
    { key: 'followers', label: 'Subscribers', format: 'count', icon: 'bi-people' },
    { key: 'followerGrowth', label: 'Follower Growth', format: 'percent', icon: 'bi-graph-up-arrow' },
    { key: 'er', label: 'ER', format: 'percent', icon: 'bi-heart-pulse' },
    { key: 'videoViews', label: 'Video Views', format: 'count', icon: 'bi-play-circle' },
    { key: 'audienceQuality', label: 'Audience Quality', format: 'percent', icon: 'bi-shield-check' },
    { key: 'audiencePakistan', label: 'Aud Based in Pakistan', format: 'percent', icon: 'bi-geo-alt' },
  ],
};

const formatCount = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
};

const formatPercent = (n) => {
  const num = Number(n) || 0;
  return num + '%';
};

const formatValue = (value, format) => {
  if (value == null || value === '' || value === 0) return '—';
  if (format === 'count') return formatCount(value);
  if (format === 'percent') return formatPercent(value);
  return String(value);
};

export default function PlatformDataView({ nomineeId, activeTab: controlledTab, onTabChange }) {
  const { data: nomineeData, isLoading } = useNomineeData(nomineeId);
  const [internalTab, setInternalTab] = useState('instagram');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = onTabChange || setInternalTab;

  const activePlatform = PLATFORMS.find((p) => p.key === activeTab);
  const platformData = nomineeData?.[activeTab] || {};
  const stats = PLATFORM_STATS[activeTab] || [];

  return (
    <motion.div
      className="card clt-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Tab bar — only shown when not controlled externally */}
      {!controlledTab && (
        <div className="d-flex flex-wrap gap-1 p-2 border-bottom">
          {PLATFORMS.map((p) => {
            const hasData = nomineeData?.[p.key]?.followers || nomineeData?.[p.key]?.profileUrl;
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
      )}

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
          <div>
            {/* Profile URL — neumorphic link card */}
            {platformData.profileUrl && (
              <a
                href={platformData.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-url-card"
              >
                <span className={`profile-url-icon ${activePlatform ? `profile-url-icon--${activePlatform.key}` : ''}`}>
                  <i className={`bi ${activePlatform?.icon}`}></i>
                </span>
                <span className="profile-url-text">{platformData.profileUrl}</span>
                <i className="bi bi-box-arrow-up-right profile-url-external"></i>
              </a>
            )}

            {/* Stats grid */}
            <div className="row g-4">
              {stats.map((stat) => {
                const value = platformData[stat.key];
                const hasValue = value != null && value !== '' && value !== 0;
                return (
                  <div key={stat.key} className="col-6 col-md-4">
                    <div className="stat-tile">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="stat-tile-icon">
                          <i className={`bi ${stat.icon}`}></i>
                        </span>
                        <span style={{ fontSize: '18px', color: '#6B7280', fontWeight: 500 }}>
                          {stat.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 500, color: hasValue ? '#111827' : '#D1D5DB', paddingLeft: '4px' , paddingTop:'10px' }}>
                        {formatValue(value, stat.format)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!platformData.followers && !platformData.profileUrl && (
              <p className="mb-0 mt-3" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                No {activePlatform?.label} data has been added for this nominee yet.
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
