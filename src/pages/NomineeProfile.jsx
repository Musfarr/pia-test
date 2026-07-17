import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNominee, useNomineeData } from '../hooks/useQueries';
import { upsertPlatformData, uploadFile } from '../util/api';

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'bi-instagram', followerLabel: 'Followers' },
  { key: 'twitter', label: 'Twitter', icon: 'bi-twitter', followerLabel: 'Followers' },
  { key: 'youtube', label: 'YouTube', icon: 'bi-youtube', followerLabel: 'Subscribers' },
  { key: 'tiktok', label: 'TikTok', icon: 'bi-tiktok', followerLabel: 'Followers' },
  { key: 'facebook', label: 'Facebook', icon: 'bi-facebook', followerLabel: 'Followers' },
];

export default function NomineeProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: nominee, isLoading: nomineeLoading } = useNominee(id);
  const { data: nomineeData, isLoading: dataLoading } = useNomineeData(id);

  const [activeTab, setActiveTab] = useState('twitter');
  const [followers, setFollowers] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Sync local form state when data loads or tab changes
  useEffect(() => {
    if (!nomineeData) return;
    const platform = nomineeData[activeTab] || {};
    setFollowers(platform.followers ? String(platform.followers) : '');
    setImage(platform.image || '');
    setSavedMsg('');
  }, [nomineeData, activeTab]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setImage(url);
    } catch (err) {
      alert('Image upload failed: ' + (err.message || 'unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      await upsertPlatformData(id, activeTab, {
        followers: followers ? Number(followers) : 0,
        image,
      });
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

  return (
    <div className="container-fluid px-3">

      {/* Header with nominee info + back link */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <Link to="/dashboard/nominees" className="clt-action-btn" title="Back to nominees">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div>
              <h6 className="cat-form-title mb-1">{nominee?.name || 'Nominee'}</h6>
              <p className="cat-form-subtitle mb-0">
                {nominee?.categoryId?.name && <span className="clt-badge me-2" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>{nominee.categoryId.name}</span>}
                {nominee?.season && <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>{nominee.season}</span>}
              </p>
            </div>
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
              <div className="row g-4">
                {/* Image upload */}
                <div className="col-12 col-md-4">
                  <span className="cat-form-label d-block mb-2">Platform Image</span>
                  <div className="d-flex flex-column align-items-center gap-3">
                    <div
                      className="clt-avatar"
                      style={{ width: '120px', height: '120px', overflow: 'hidden', borderRadius: '12px', fontSize: '40px' }}
                    >
                      {image ? (
                        <img src={image} alt="Platform" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className={`bi ${activePlatform?.icon}`} style={{ fontSize: '40px' }}></i>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (<><output className="spinner-border spinner-border-sm me-1"></output> Uploading…</>) : (<><i className="bi bi-upload"></i> Upload</>)}
                      </button>
                      {image && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setImage('')}
                          disabled={uploading}
                        >
                          <i className="bi bi-x-lg"></i> Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Followers field */}
                <div className="col-12 col-md-8">
                  <div className="cat-form-field mb-4">
                    <label className="cat-form-label" htmlFor="platform-followers">
                      {activePlatform?.followerLabel}
                    </label>
                    <input
                      id="platform-followers"
                      className="cat-form-input"
                      type="number"
                      min="0"
                      placeholder={`Enter ${activePlatform?.followerLabel?.toLowerCase()} count`}
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                    />
                  </div>

                  {/* Save button + status */}
                  <div className="d-flex align-items-center gap-3">
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
