import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoterRegister } from '../../hooks/usePublicQueries';

export default function PublicRegister() {
  const navigate = useNavigate();
  const registerMutation = useVoterRegister();

  const [form, setForm] = useState({ name: '', phone: '', username: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit phone';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await registerMutation.mutateAsync({
        name: form.name.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      navigate('/vote/verify-otp', { state: { phone: form.phone.trim(), username: form.username.trim() } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    }
  };

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: '' });
  };

  return (
    <div className="pv-auth-wrap">
      <motion.div
        className="pv-auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="pv-auth-logo">
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#5006ba' }}>PIA</div>
        </div>
        <h1 className="pv-auth-title">Create Account</h1>
        <p className="pv-auth-subtitle">Vote for Pakistan's Influencer Awards</p>

        {serverError && (
          <div className="pv-error">
            <i className="bi bi-exclamation-circle"></i>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="pv-field">
            <label className="pv-label">Full Name</label>
            <input className="pv-input" type="text" placeholder="Your name" value={form.name} onChange={update('name')} />
            {errors.name && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.name}</div>}
          </div>

          <div className="pv-field">
            <label className="pv-label">Phone</label>
            <div className="pv-input-group">
              <span className="pv-input-prefix">+92</span>
              <input className="pv-input" type="tel" placeholder="3XX XXXXXXX" value={form.phone} onChange={update('phone')} />
            </div>
            {errors.phone && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.phone}</div>}
          </div>

          <div className="pv-field">
            <label className="pv-label">Username</label>
            <input className="pv-input" type="text" placeholder="Choose a username" value={form.username} onChange={update('username')} />
            {errors.username && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.username}</div>}
          </div>

          <div className="pv-field">
            <label className="pv-label">Password</label>
            <input className="pv-input" type="password" placeholder="At least 6 characters" value={form.password} onChange={update('password')} />
            {errors.password && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.password}</div>}
          </div>

          <div className="pv-field">
            <label className="pv-label">Confirm Password</label>
            <input className="pv-input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={update('confirm')} />
            {errors.confirm && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.confirm}</div>}
          </div>

          <button type="submit" className="pv-btn-primary" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? (
              <><output className="spinner-border spinner-border-sm me-2"></output>Creating…</>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="pv-link">
          Already have an account? <a href="/vote/login">Log in</a>
        </div>
      </motion.div>
    </div>
  );
}
