import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoterVerifyOtp, useRequestOtp } from '../../hooks/usePublicQueries';
import { usePublicAuth } from '../../context/PublicAuthProvider';
import logo from '../../assets/logow.png';

export default function PublicVerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setVoterSession } = usePublicAuth();
  const verifyMutation = useVoterVerifyOtp();
  const resendMutation = useRequestOtp();

  const phone = location.state?.phone || '';
  const name = location.state?.name || '';

  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // If no phone in state, redirect back to login
  useEffect(() => {
    if (!phone) navigate('/vote/login', { replace: true });
  }, [phone, navigate]);

  const maskedPhone = phone ? `+92••• ••${phone.slice(-4)}` : '';

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');

    if (val && idx < 4) {
      refs.current[idx + 1]?.focus();
    }
    // Auto-submit on 5th digit
    if (val && idx === 4) {
      handleSubmit(next.join(''));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (code) => {
    const otp = code || digits.join('');
    if (otp.length !== 5) return;
    setError('');

    try {
      const data = await verifyMutation.mutateAsync({ phone, otp });
      setVoterSession(data);
      navigate('/vote');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
      setDigits(['', '', '', '', '']);
      refs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendTimer(30);
    try {
      await resendMutation.mutateAsync({ name, phone });
    } catch {
      // Silent — static OTP, resend is cosmetic
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
        <h1 className="pv-auth-title">Verify Your Phone</h1>
        <p className="pv-auth-subtitle">We sent a code to {maskedPhone}</p>

        {error && (
          <div className="pv-error">
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="pv-otp-wrap">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`pv-otp-box ${error ? 'pv-otp-box--error' : ''}`}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <p className="pv-otp-hint">Enter the 5-digit code</p>

        <button
          className="pv-btn-primary"
          onClick={() => handleSubmit()}
          disabled={verifyMutation.isPending || digits.join('').length !== 5}
        >
          {verifyMutation.isPending ? (
            <><output className="spinner-border spinner-border-sm me-2"></output>Verifying…</>
          ) : 'Verify'}
        </button>

        <div className="pv-resend">
          {resendTimer > 0 ? (
            <span>Resend code in {resendTimer}s</span>
          ) : (
            <button onClick={handleResend} disabled={resendMutation.isPending}>Resend code</button>
          )}
        </div>

        <div className="pv-link">
          <a href="/vote/login">Change phone number</a>
        </div>
      </motion.div>
    </div>
  );
}
