import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRequestOtp } from '../../hooks/usePublicQueries';
import logo from '../../assets/logow.png';

export default function PublicLogin() {
  const navigate = useNavigate();
  const requestOtpMutation = useRequestOtp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await requestOtpMutation.mutateAsync({ name: name.trim(), phone: phone.trim() });
      navigate('/vote/verify-otp', { state: { phone: phone.trim(), name: name.trim() } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  return (
    <div className="pv-auth-wrap">
      <motion.div
        className="pv-auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="login-logo-section">
          <img src={logo} width={180} alt="PIA" />
        </div>
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
            <input
              className="pv-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }); }}
            />
            {errors.name && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.name}</div>}
          </div>

          <div className="pv-field">
            <label className="pv-label">Phone</label>
            <div className="pv-input-group">
              <span className="pv-input-prefix">+92</span>
              <input
                className="pv-input"
                type="tel"
                placeholder="3XX XXXXXXX"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
              />
            </div>
            {errors.phone && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.phone}</div>}
          </div>

          <button type="submit" className="pv-btn-primary" disabled={requestOtpMutation.isPending}>
            {requestOtpMutation.isPending ? (
              <><output className="spinner-border spinner-border-sm me-2"></output>Sending…</>
            ) : 'Vote Now'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
