import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useNomineeData } from '../hooks/useQueries';

// Read-only platform data viewer used by jury when scoring a nominee.
// Only 3 platforms: Instagram, YouTube, TikTok.
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'bi-instagram', followerLabel: 'Followers' },
  { key: 'youtube', label: 'YouTube', icon: 'bi-youtube', followerLabel: 'Subscribers' },
  { key: 'tiktok', label: 'TikTok', icon: 'bi-tiktok', followerLabel: 'Followers' },
];

// ── Per-stat gauge config: each quality metric has its own scale ──
// ER is realistically 0-15% for most creators, so max=15.
// Audience/Likers Quality are genuinely 0-100 scores.
const GAUGE_CONFIG = {
  er: { max: 15, thresholds: [5, 10] },        // <5% red, 5-10% amber, >10% green
  audienceQuality: { max: 100, thresholds: [40, 70] },
  likersQuality: { max: 100, thresholds: [40, 70] },
};

const colorForValue = (value, config) => {
  if (!config) return '#6B7280';
  const pct = (value / config.max) * 100;
  if (pct < config.thresholds[0]) return '#DC2626';
  if (pct < config.thresholds[1]) return '#D97706';
  return '#059669';
};

// ── Format helpers ──
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

const hasValue = (v) => v != null && v !== '' && v !== 0;

// ── Compact radial gauge (reuses ECharts pattern from ScoringProgressGauges) ──
function MiniGauge({ label, value, config, icon }) {
  const hasData = hasValue(value);
  const color = hasData ? colorForValue(value, config) : '#D1D5DB';
  const displayValue = hasData ? value : 0;
  const pct = hasData ? Math.min((value / config.max) * 100, 100) : 0;

  const option = {
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: config.max,
      radius: '82%',
      center: ['50%', '58%'],
      pointer: { show: false },
      progress: { show: true, roundCap: true, width: 10, itemStyle: { color: hasData ? color : '#E5E7EB' } },
      axisLine: { roundCap: true, lineStyle: { width: 10, color: [[1, '#E5E7EB']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: hasData ? '{value}%' : '—',
        color: hasData ? color : '#D1D5DB',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Outfit',
        offsetCenter: [0, '-6%'],
      },
      data: [{ value: displayValue }],
    }],
  };

  return (
    <div className="pdv-gauge-tile">
      <div style={{ height: '110px' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} settings={{ notMerge: true }} />
      </div>
      <div className="pdv-gauge-label">
        <i className={`bi ${icon} me-1`} style={{ color: '#9CA3AF' }}></i>
        {label}
      </div>
    </div>
  );
}

// ── Growth delta chip (directional, not a gauge) ──
function GrowthChip({ value }) {
  const hasData = hasValue(value);
  if (!hasData) {
    return (
      <div className="pdv-gauge-tile">
        <div className="pdv-growth-empty">
          <i className="bi bi-graph-up-arrow" style={{ fontSize: '28px', color: '#D1D5DB' }}></i>
          <div className="pdv-gauge-label" style={{ marginTop: '8px' }}>
            <i className="bi bi-graph-up-arrow me-1" style={{ color: '#9CA3AF' }}></i>
            Follower Growth
          </div>
        </div>
      </div>
    );
  }

  const isPositive = value > 0;
  const color = isPositive ? '#059669' : '#DC2626';

  return (
    <div className="pdv-gauge-tile">
      <div className="pdv-growth-chip" style={{ borderColor: color }}>
        <i className={`bi ${isPositive ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} style={{ fontSize: '32px', color }}></i>
        <div style={{ fontSize: '24px', fontWeight: 800, color }}>{Math.abs(value)}%</div>
        <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600 }}>growth</div>
      </div>
      <div className="pdv-gauge-label">
        <i className="bi bi-graph-up-arrow me-1" style={{ color: '#9CA3AF' }}></i>
        Follower Growth
      </div>
    </div>
  );
}

// ── Geography split bar ──
function GeographyBar({ label, value, icon }) {
  const hasData = hasValue(value);
  const pct = hasData ? Math.min(value, 100) : 0;

  return (
    <div className="pdv-geo-row">
      <div className="pdv-geo-header">
        <span className="pdv-geo-label">
          <i className={`bi ${icon} me-1`}></i>
          {label}
        </span>
        <span className="pdv-geo-pct" style={{ color: hasData ? '#5006ba' : '#D1D5DB' }}>
          {hasData ? `${pct}%` : '—'}
        </span>
      </div>
      <div className="pdv-geo-track">
        <div className="pdv-geo-fill" style={{ width: hasData ? `${pct}%` : '0%' }} />
      </div>
      <div className="pdv-geo-legend">
        <span className="pdv-geo-legend-pk">
          <span className="pdv-geo-dot pdv-geo-dot--pk"></span>
          Pakistan {hasData ? `${pct}%` : '—'}
        </span>
        <span className="pdv-geo-legend-rest">
          <span className="pdv-geo-dot pdv-geo-dot--rest"></span>
          Rest of world {hasData ? `${100 - pct}%` : '—'}
        </span>
      </div>
    </div>
  );
}

// ── Section header ──
function SectionHeader({ icon, title }) {
  return (
    <div className="pdv-section-header">
      <span className="pdv-section-icon">
        <i className={`bi ${icon}`}></i>
      </span>
      <span className="pdv-section-title">{title}</span>
    </div>
  );
}

// ── Stat definitions per platform, grouped by section ──
const PLATFORM_SECTIONS = {
  instagram: {
    reach: [
      { key: 'followers', label: 'Followers', icon: 'bi-people' },
      { key: 'videoViews', label: 'Video Views', icon: 'bi-play-circle' },
      { key: 'postViews', label: 'Post Views', icon: 'bi-eye' },
    ],
    quality: [
      { key: 'er', label: 'ER', icon: 'bi-heart-pulse', type: 'gauge' },
      { key: 'audienceQuality', label: 'Audience Quality', icon: 'bi-shield-check', type: 'gauge' },
      { key: 'likersQuality', label: 'Likers Quality', icon: 'bi-hand-thumbs-up', type: 'gauge' },
      { key: 'followerGrowth', label: 'Follower Growth', icon: 'bi-graph-up-arrow', type: 'growth' },
    ],
    geography: [
      { key: 'audiencePakistan', label: 'Aud Based in Pakistan', icon: 'bi-geo-alt' },
      { key: 'likersPakistan', label: 'Likers from Pakistan', icon: 'bi-flag' },
    ],
  },
  tiktok: {
    reach: [
      { key: 'followers', label: 'Followers', icon: 'bi-people' },
      { key: 'videoViews', label: 'Video Views', icon: 'bi-play-circle' },
    ],
    quality: [
      { key: 'er', label: 'ER', icon: 'bi-heart-pulse', type: 'gauge' },
      { key: 'audienceQuality', label: 'Audience Quality', icon: 'bi-shield-check', type: 'gauge' },
      { key: 'followerGrowth', label: 'Follower Growth', icon: 'bi-graph-up-arrow', type: 'growth' },
    ],
    geography: [
      { key: 'audiencePakistan', label: 'Aud Based in Pakistan', icon: 'bi-geo-alt' },
    ],
  },
  youtube: {
    reach: [
      { key: 'followers', label: 'Subscribers', icon: 'bi-people' },
      { key: 'videoViews', label: 'Video Views', icon: 'bi-play-circle' },
    ],
    quality: [
      { key: 'er', label: 'ER', icon: 'bi-heart-pulse', type: 'gauge' },
      { key: 'audienceQuality', label: 'Audience Quality', icon: 'bi-shield-check', type: 'gauge' },
      { key: 'followerGrowth', label: 'Follower Growth', icon: 'bi-graph-up-arrow', type: 'growth' },
    ],
    geography: [
      { key: 'audiencePakistan', label: 'Aud Based in Pakistan', icon: 'bi-geo-alt' },
    ],
  },
};

export default function PlatformDataView({ nomineeId, activeTab: controlledTab, onTabChange }) {
  const { data: nomineeData, isLoading } = useNomineeData(nomineeId);
  const [internalTab, setInternalTab] = useState('instagram');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = onTabChange || setInternalTab;

  const activePlatform = PLATFORMS.find((p) => p.key === activeTab);
  const platformData = nomineeData?.[activeTab] || {};
  const sections = PLATFORM_SECTIONS[activeTab] || { reach: [], quality: [], geography: [] };

  // ── Profile snapshot headline ──
  const snapshotParts = [];
  if (hasValue(platformData.followers)) snapshotParts.push(`${formatCount(platformData.followers)} ${activePlatform?.followerLabel?.toLowerCase() || 'followers'}`);
  const geoStat = sections.geography?.[0];
  if (geoStat && hasValue(platformData[geoStat.key])) snapshotParts.push(`${platformData[geoStat.key]}% Pakistan-based`);
  if (hasValue(platformData.er)) snapshotParts.push(`${platformData.er}% engagement rate`);

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

            {/* Profile snapshot headline */}
            {snapshotParts.length > 0 && (
              <div className="pdv-snapshot">
                {snapshotParts.join(' · ')}
              </div>
            )}

            {/* Section 1 — Reach */}
            {sections.reach.length > 0 && (
              <div className="pdv-section">
                <SectionHeader icon="bi-broadcast" title="Reach" />
                <div className="row g-3">
                  {sections.reach.map((stat) => {
                    const value = platformData[stat.key];
                    const has = hasValue(value);
                    return (
                      <div key={stat.key} className="col-6 col-md-4">
                        <div className="pdv-reach-tile">
                          <span className="pdv-reach-icon">
                            <i className={`bi ${stat.icon}`}></i>
                          </span>
                          <div>
                            <div className="pdv-reach-label">{stat.label}</div>
                            <div className="pdv-reach-value" style={{ color: has ? '#111827' : '#D1D5DB' }}>
                              {has ? formatCount(value) : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2 — Engagement & Quality */}
            {sections.quality.length > 0 && (
              <div className="pdv-section">
                <SectionHeader icon="bi-heart-pulse" title="Engagement & Quality" />
                <div className="row g-2">
                  {sections.quality.map((stat) => {
                    const value = platformData[stat.key];
                    if (stat.type === 'gauge') {
                      return (
                        <div key={stat.key} className="col-6 col-md-3">
                          <MiniGauge
                            label={stat.label}
                            value={value}
                            config={GAUGE_CONFIG[stat.key]}
                            icon={stat.icon}
                          />
                        </div>
                      );
                    }
                    if (stat.type === 'growth') {
                      return (
                        <div key={stat.key} className="col-6 col-md-3">
                          <GrowthChip value={value} />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Section 3 — Audience Geography */}
            {sections.geography.length > 0 && (
              <div className="pdv-section">
                <SectionHeader icon="bi-geo-alt-fill" title="Audience Geography" />
                <div className="d-flex flex-column gap-3">
                  {sections.geography.map((stat) => (
                    <GeographyBar
                      key={stat.key}
                      label={stat.label}
                      value={platformData[stat.key]}
                      icon={stat.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!hasValue(platformData.followers) && !platformData.profileUrl && (
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
