import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoterLogin } from '../../hooks/usePublicQueries';
import { usePublicAuth } from '../../context/PublicAuthProvider';

export default function PublicLogin() {
  const navigate = useNavigate();
  const { setVoterSession } = usePublicAuth();
  const loginMutation = useVoterLogin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [needsVerify, setNeedsVerify] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setNeedsVerify('');

    if (!identifier || !password) {
      setServerError('Please enter your phone/username and password');
      return;
    }

    try {
      const data = await loginMutation.mutateAsync({ identifier, password });
      setVoterSession(data);
      navigate('/vote');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.status === 403 && err.response?.data?.phone) {
        setNeedsVerify(err.response.data.phone);
      } else {
        setServerError(msg);
      }
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
        <div className="pv-auth-logo">
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#5006ba' }}>PIA</div>
        </div>
        <h1 className="pv-auth-title">Welcome Back</h1>
        <p className="pv-auth-subtitle">Log in to vote for your favorites</p>

        {serverError && (
          <div className="pv-error">
            <i className="bi bi-exclamation-circle"></i>
            <span>{serverError}</span>
          </div>
        )}

        {needsVerify && (
          <div className="pv-error" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}>
            <i className="bi bi-phone"></i>
            <span>Phone not verified. <a href="/vote/verify-otp" style={{ color: '#92400E', fontWeight: 700 }}>Verify now</a></span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="pv-field">
            <label className="pv-label">Phone or Username</label>
            <input
              className="pv-input"
              type="text"
              placeholder="e.g. 3XX1234567 or your_username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="pv-field">
            <label className="pv-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="pv-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '18px',
                }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="pv-btn-primary" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <><output className="spinner-border spinner-border-sm me-2"></output>Logging in…</>
            ) : 'Log In'}
          </button>
        </form>

        <div className="pv-link">
          New here? <a href="/vote/register">Create an account</a>
        </div>
      </motion.div>
    </div>
  );
}
