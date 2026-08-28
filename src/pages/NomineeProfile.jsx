import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNominee, useNomineeData } from '../hooks/useQueries';
import { upsertPlatformData, updateNominee, uploadFile } from '../util/api';

// Only 3 platforms are supported
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'bi-instagram', followerLabel: 'Followers' },
  { key: 'youtube', label: 'YouTube', icon: 'bi-youtube', followerLabel: 'Subscribers' },
  { key: 'tiktok', label: 'TikTok', icon: 'bi-tiktok', followerLabel: 'Followers' },
];

// Per-platform field definitions — drives the form rendering
const PLATFORM_FIELDS = {
  instagram: [
    { key: 'profileUrl', label: 'Profile URL', type: 'text', placeholder: 'https://www.instagram.com/username' },
    { key: 'followers', label: 'Followers', type: 'number', placeholder: 'e.g. 1500000' },
    { key: 'followerGrowth', label: 'Follower Growth (%)', type: 'number', placeholder: 'e.g. 1.6', step: '0.1' },
    { key: 'er', label: 'ER %', type: 'number', placeholder: 'e.g. 3', step: '0.1' },
    { key: 'videoViews', label: 'Video Views', type: 'number', placeholder: 'e.g. 1500000' },
    { key: 'postViews', label: 'Post Views', type: 'number', placeholder: 'e.g. 200000' },
    { key: 'audienceQuality', label: 'Audience Quality (%)', type: 'number', placeholder: 'e.g. 71' },
    { key: 'audiencePakistan', label: 'Aud Based in Pakistan (%)', type: 'number', placeholder: 'e.g. 82' },
    { key: 'likersQuality', label: 'Likers Quality (%)', type: 'number', placeholder: 'e.g. 88' },
    { key: 'likersPakistan', label: 'Likers Audience from Pakistan (%)', type: 'number', placeholder: 'e.g. 54' },
  ],
  tiktok: [
    { key: 'profileUrl', label: 'Profile URL', type: 'text', placeholder: 'https://www.tiktok.com/@username' },
    { key: 'followers', label: 'Followers', type: 'number', placeholder: 'e.g. 1500000' },
    { key: 'followerGrowth', label: 'Follower Growth (%)', type: 'number', placeholder: 'e.g. 1.6', step: '0.1' },
    { key: 'er', label: 'ER %', type: 'number', placeholder: 'e.g. 3', step: '0.1' },
    { key: 'videoViews', label: 'Video Views', type: 'number', placeholder: 'e.g. 1500000' },
    { key: 'audienceQuality', label: 'Audience Quality (%)', type: 'number', placeholder: 'e.g. 71' },
    { key: 'audiencePakistan', label: 'Aud Based in Pakistan (%)', type: 'number', placeholder: 'e.g. 82' },
  ],
  youtube: [
    { key: 'profileUrl', label: 'Channel URL', type: 'text', placeholder: 'https://www.youtube.com/@channel' },
    { key: 'followers', label: 'Subscribers', type: 'number', placeholder: 'e.g. 1100000' },
    { key: 'followerGrowth', label: 'Follower Growth (%)', type: 'number', placeholder: 'e.g. 1.6', step: '0.1' },
    { key: 'er', label: 'ER %', type: 'number', placeholder: 'e.g. 3', step: '0.1' },
    { key: 'videoViews', label: 'Video Views', type: 'number', placeholder: 'e.g. 1500000' },
    { key: 'audienceQuality', label: 'Audience Quality (%)', type: 'number', placeholder: 'e.g. 71' },
    { key: 'audiencePakistan', label: 'Aud Based in Pakistan (%)', type: 'number', placeholder: 'e.g. 82' },
  ],
};

// All possible platform field keys (for initializing form state)
const ALL_FIELD_KEYS = [
  'profileUrl', 'followers', 'followerGrowth', 'er', 'videoViews',
  'audienceQuality', 'audiencePakistan',
  'postViews', 'likersQuality', 'likersPakistan',
];

export default function NomineeProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: nominee, isLoading: nomineeLoading } = useNominee(id);
  const { data: nomineeData, isLoading: dataLoading } = useNomineeData(id);  const [activeTab, setActiveTab] = useState('instagram');
  const [formData, setFormData] = useState({});
  const [interests, setInterests] = useState({ audience: [], likers: [] });
  const [profileImage, setProfileImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const profileFileInputRef = useRef(null);

  // Sync platform form state when data loads or tab changes
  useEffect(() => {
    if (!nomineeData) return;
    const platform = nomineeData[activeTab] || {};
    const next = {};
    for (const key of ALL_FIELD_KEYS) {
      if (key === 'profileUrl') {
        next[key] = platform[key] || '';
      } else {
        next[key] = platform[key] != null ? String(platform[key]) : '';
      }
    }
    setFormData(next);
    setInterests({
      audience: Array.isArray(platform.interests?.audience)
        ? platform.interests.audience.map((i) => ({ name: i.name || '', percentage: i.percentage ?? '' }))
        : [],
      likers: Array.isArray(platform.interests?.likers)
        ? platform.interests.likers.map((i) => ({ name: i.name || '', percentage: i.percentage ?? '' }))
        : [],
    });
    setSavedMsg('');
  }, [nomineeData, activeTab]);

  // Sync profile image from nominee record
  useEffect(() => {
    if (!nominee) return;
    setProfileImage(nominee.profileImage || '');
  }, [nominee]);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddInterest = (type) => {
    setInterests((prev) => ({
      ...prev,
      [type]: [...prev[type], { name: '', percentage: '' }],
    }));
  };

  const handleRemoveInterest = (type, index) => {
    setInterests((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleInterestChange = (type, index, field, value) => {
    setInterests((prev) => {
      const nextList = [...prev[type]];
      nextList[index] = { ...nextList[index], [field]: value };
      return { ...prev, [type]: nextList };
    });
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfile(true);
    try {
      const { url } = await uploadFile(file);
      setProfileImage(url);
    } catch (err) {
      alert('Profile image upload failed: ' + (err.message || 'unknown error'));
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleSaveProfileImage = async () => {
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      await updateNominee(id, { profileImage });
      queryClient.invalidateQueries({ queryKey: ['nominee', id] });
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
      queryClient.invalidateQueries({ queryKey: ['shortlists'] });
      setProfileSavedMsg('Photo saved');
      setTimeout(() => setProfileSavedMsg(''), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile image');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      // Build payload — convert numeric fields to Numbers, leave strings as-is
      const payload = {};
      const activeFields = PLATFORM_FIELDS[activeTab];
      for (const field of activeFields) {
        const val = formData[field.key];
        if (val === undefined || val === '') {
          payload[field.key] = field.type === 'number' ? 0 : '';
        } else if (field.type === 'number') {
          payload[field.key] = Number(val);
        } else {
          payload[field.key] = val;
        }
      }

      // Dynamic Interests
      payload.interests = {
        audience: interests.audience
          .filter((item) => item && item.name.trim() !== '')
          .map((item) => ({
            name: item.name.trim(),
            percentage: Math.min(100, Math.max(0, Number(item.percentage) || 0)),
          })),
        likers: interests.likers
          .filter((item) => item && item.name.trim() !== '')
          .map((item) => ({
            name: item.name.trim(),
            percentage: Math.min(100, Math.max(0, Number(item.percentage) || 0)),
          })),
      };

      await upsertPlatformData(id, activeTab, payload);
      queryClient.invalidateQueries({ queryKey: ['nomineeData', id] });
      setSavedMsg('Saved successfully');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save platform data');
    } finally {
      setSaving(false);
    }
  };

  if (nomineeLoading) {
    return (
      <div className="container-fluid px-3">
        <div className="text-center py-5">
          <output className="spinner-border text-primary"></output>
        </div>
      </div>
    );
  }

  const activePlatform = PLATFORMS.find((p) => p.key === activeTab);
  const activeFields = PLATFORM_FIELDS[activeTab];

  return (
    <div className="container-fluid px-3">

      {/* Merged header — nominee photo + name + category + inline image upload */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center gap-4 flex-wrap">
          {/* Back button */}
          <Link to="/dashboard/nominees" className="clt-action-btn" title="Back to nominees" style={{ flexShrink: 0 }}>
            <i className="bi bi-arrow-left"></i>
          </Link>

          {/* Profile image with hover upload overlay */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              className="clt-avatar"
              style={{ width: '110px', height: '110px', overflow: 'hidden', borderRadius: '14px', fontSize: '40px' }}
            >
              {profileImage ? (
                <img src={profileImage} alt={nominee?.name || 'Nominee'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {nominee?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            {/* Upload overlay on hover */}
            <button
              type="button"
              onClick={() => profileFileInputRef.current?.click()}
              disabled={uploadingProfile}
              title="Upload photo"
              style={{
                position: 'absolute',
                bottom: 0, right: 0,
                width: '34px', height: '34px',
                borderRadius: '50%',
                border: '2px solid #fff',
                background: 'radial-gradient(circle at 60% 40%, #6510b4, #29055e)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploadingProfile ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            >
              {uploadingProfile ? (
                <output className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></output>
              ) : (
                <i className="bi bi-camera" style={{ fontSize: '14px' }}></i>
              )}
            </button>
            <input
              ref={profileFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name + category + season */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <h6 className="cat-form-title mb-1">{nominee?.name || 'Nominee'}</h6>
            <p className="cat-form-subtitle mb-0">
              {nominee?.categoryId?.name && <span className="clt-badge me-2" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>{nominee.categoryId.name}</span>}
              {nominee?.season && <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>{nominee.season}</span>}
            </p>
          </div>

          {/* Save photo + remove buttons (only show when there's an unsaved change) */}
          <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
            {profileImage && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => setProfileImage('')}
                disabled={uploadingProfile || savingProfile}
                title="Remove photo"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
            <button
              type="button"
              className="cat-form-submit"
              onClick={handleSaveProfileImage}
              disabled={savingProfile || uploadingProfile}
              style={{ width: 'auto', paddingLeft: '20px', paddingRight: '20px' }}
            >
              {savingProfile ? 'Saving...' : (<><i className="bi bi-check-lg"></i> Save Photo</>)}
            </button>
            {profileSavedMsg && (
              <span style={{ color: '#059669', fontSize: '14px' }}>
                <i className="bi bi-check-circle-fill"></i> {profileSavedMsg}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Platform tabs */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="card clt-card">
          {/* Tab bar */}
          <div className="d-flex flex-wrap gap-1 p-2 border-bottom">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 ${activeTab === p.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab(p.key)}
                style={{ borderRadius: '8px' }}
              >
                <i className={`bi ${p.icon}`}></i>
                {p.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="card-body p-4">
            {dataLoading ? (
              <div className="text-center py-4">
                <output className="spinner-border text-primary"></output>
                <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading {activePlatform?.label} data…</p>
              </div>
            ) : (
              <div className="row g-3">
                {activeFields.map((field) => (
                  <div key={field.key} className={field.key === 'profileUrl' ? 'col-12' : 'col-12 col-md-6'}>
                    <div className="cat-form-field">
                      <label className="cat-form-label" htmlFor={`field-${field.key}`}>
                        {field.label}
                      </label>
                      <input
                        id={`field-${field.key}`}
                        className="cat-form-input"
                        type={field.type}
                        min={field.type === 'number' ? '0' : undefined}
                        step={field.step || undefined}
                        placeholder={field.placeholder}
                        value={formData[field.key] ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                {/* Dynamic Interests Section */}
                <div className="col-12 mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-pie-chart-fill" style={{ color: '#5006ba', fontSize: '18px' }}></i>
                      <h6 className="cat-form-title mb-0" style={{ fontSize: '15px' }}>
                        {activePlatform?.label} Interests & Demographics
                      </h6>
                    </div>
                  </div>

                  <div className="row g-4">
                    {/* Audience Interests */}
                    <div className="col-12 col-lg-6">
                      <div className="p-3" style={{ background: '#FAF9FC', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <i className="bi bi-people-fill me-1" style={{ color: '#7C3AED' }}></i> Audience Interests
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleAddInterest('audience')}
                            style={{ fontSize: '12px', fontWeight: 600, color: '#5006ba', background: '#F3E8FF', borderRadius: '6px', border: 'none', padding: '4px 10px' }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> Add Interest
                          </button>
                        </div>

                        {interests.audience.length === 0 ? (
                          <p className="text-muted mb-0 py-2" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                            No audience interests added for {activePlatform?.label}. Click "+ Add Interest" to add.
                          </p>
                        ) : (
                          <div className="d-flex flex-column gap-2 mt-2">
                            {interests.audience.map((item, idx) => (
                              <div key={idx} className="d-flex align-items-center gap-2">
                                <input
                                  type="text"
                                  className="cat-form-input"
                                  placeholder="Interest (e.g. Fashion & Style)"
                                  value={item.name}
                                  onChange={(e) => handleInterestChange('audience', idx, 'name', e.target.value)}
                                  style={{ flex: 2, padding: '6px 12px', fontSize: '13px' }}
                                />
                                <div style={{ position: 'relative', width: '90px', flexShrink: 0 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="cat-form-input"
                                    placeholder="%"
                                    value={item.percentage}
                                    onChange={(e) => handleInterestChange('audience', idx, 'percentage', e.target.value)}
                                    style={{ padding: '6px 22px 6px 10px', fontSize: '13px', textAlign: 'right' }}
                                  />
                                  <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9CA3AF', pointerEvents: 'none' }}>%</span>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveInterest('audience', idx)}
                                  title="Remove"
                                  style={{ width: '32px', height: '34px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                                >
                                  <i className="bi bi-x-lg" style={{ fontSize: '12px' }}></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Likers Interests */}
                    <div className="col-12 col-lg-6">
                      <div className="p-3" style={{ background: '#FAF9FC', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <i className="bi bi-heart-fill me-1" style={{ color: '#E11D48' }}></i> Likers Interests
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleAddInterest('likers')}
                            style={{ fontSize: '12px', fontWeight: 600, color: '#5006ba', background: '#F3E8FF', borderRadius: '6px', border: 'none', padding: '4px 10px' }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> Add Interest
                          </button>
                        </div>

                        {interests.likers.length === 0 ? (
                          <p className="text-muted mb-0 py-2" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                            No likers interests added for {activePlatform?.label}. Click "+ Add Interest" to add.
                          </p>
                        ) : (
                          <div className="d-flex flex-column gap-2 mt-2">
                            {interests.likers.map((item, idx) => (
                              <div key={idx} className="d-flex align-items-center gap-2">
                                <input
                                  type="text"
                                  className="cat-form-input"
                                  placeholder="Interest (e.g. Entertainment)"
                                  value={item.name}
                                  onChange={(e) => handleInterestChange('likers', idx, 'name', e.target.value)}
                                  style={{ flex: 2, padding: '6px 12px', fontSize: '13px' }}
                                />
                                <div style={{ position: 'relative', width: '90px', flexShrink: 0 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="cat-form-input"
                                    placeholder="%"
                                    value={item.percentage}
                                    onChange={(e) => handleInterestChange('likers', idx, 'percentage', e.target.value)}
                                    style={{ padding: '6px 22px 6px 10px', fontSize: '13px', textAlign: 'right' }}
                                  />
                                  <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9CA3AF', pointerEvents: 'none' }}>%</span>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveInterest('likers', idx)}
                                  title="Remove"
                                  style={{ width: '32px', height: '34px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                                >
                                  <i className="bi bi-x-lg" style={{ fontSize: '12px' }}></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button + status */}
                <div className="col-12">
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <button
                      type="button"
                      className="cat-form-submit"
                      onClick={handleSave}
                      disabled={saving}
                      style={{ width: 'auto', paddingLeft: '24px', paddingRight: '24px' }}
                    >
                      {saving ? 'Saving...' : (<><i className="bi bi-check-lg"></i> Save {activePlatform?.label} Data</>)}
                    </button>
                    {savedMsg && (
                      <span style={{ color: '#059669', fontSize: '14px' }}>
                        <i className="bi bi-check-circle-fill"></i> {savedMsg}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
