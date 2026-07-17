import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { juryTypes } from '../data/dashboardData';
import { useJuries } from '../hooks/useQueries';
import { createJury, deleteJury, assignJuryCategory, uploadFile } from '../util/api';
import JuryTable from '../components/JuryTable';

export default function Jury() {
  const queryClient = useQueryClient();
  const { data: juries = [], isLoading } = useJuries();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !type || !username.trim() || !password.trim()) return;

    setSubmitting(true);
    try {
      await createJury({
        name: name.trim(),
        image,
        type,
        username: username.trim(),
        password: password.trim(),
        category: '',
      });
      queryClient.invalidateQueries({ queryKey: ['juries'] });
      setName('');
      setType('');
      setUsername('');
      setPassword('');
      setImage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create jury member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJury(id);
      queryClient.invalidateQueries({ queryKey: ['juries'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete jury member');
    }
  };

  const handleAssignCategory = async (id, category) => {
    try {
      await assignJuryCategory(id, category);
      queryClient.invalidateQueries({ queryKey: ['juries'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign category');
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
        <h6 className="cat-form-title">Create Jury</h6>
        <p className="cat-form-subtitle">Add a new jury member and assign their access credentials</p>

        <form onSubmit={handleSubmit}>
          <div className="cat-form-row">
            <div className="cat-form-image-field">
              <label className="cat-form-label" htmlFor="jury-image">Photo</label>
              <div className="cat-form-image-upload">
                <div className="cat-form-image-preview">
                  {image ? <img src={image} alt="Preview" /> : <i className="bi bi-person"></i>}
                </div>
                <button
                  type="button"
                  className="cat-form-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (<><output className="spinner-border spinner-border-sm me-1"></output> Uploading…</>) : (<><i className="bi bi-upload"></i> Upload</>)}
                </button>
                <input
                  id="jury-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="jury-name">Name</label>
              <input
                id="jury-name"
                className="cat-form-input"
                type="text"
                placeholder="e.g. Ayesha Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="jury-type">Type</label>
              <select
                id="jury-type"
                className="cat-form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="" disabled>Select type</option>
                {juryTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="jury-username">Username</label>
              <input
                id="jury-username"
                className="cat-form-input"
                type="text"
                placeholder="e.g. ayesha.khan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="cat-form-field">
              <label className="cat-form-label" htmlFor="jury-password">Password</label>
              <div className="cat-form-password-wrap">
                <input
                  id="jury-password"
                  className="cat-form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="cat-form-password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="cat-form-submit" disabled={submitting}>
              {submitting ? 'Adding...' : (<><i className="bi bi-plus-lg"></i> Add Jury</>)}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <JuryTable juries={juries} onDelete={handleDelete} onAssignCategory={handleAssignCategory} isLoading={isLoading} />
      </motion.div>

    </div>
  );
}
