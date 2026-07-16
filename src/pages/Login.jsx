import { useState } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../util/api';
import { getDefaultRoute } from '../util/roles';
import loginBg from '../assets/bgimg.png';
import logo from '../assets/logow.png';
import loginWaveform from '../assets/portalanim.webm';
import './Login.css';



const FEATURES = [
  {
    icon: 'bi-mic-fill',
    title: 'AI-Powered Voice',
    desc: 'Intelligent automation for every conversation.',
  },
  {
    icon: 'bi-bar-chart-line',
    title: 'Real-time Analytics',
    desc: 'Actionable insights for better decisions',
  },
  {
    icon: 'bi-shield-check',
    title: 'Secure & Reliable',
    desc: 'Enterprise-grade security and 99.9% uptime.',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { SetLoginData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      SetLoginData(data);
      navigate(getDefaultRoute(data?.userData?.role));
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <img src={loginBg} alt="" className="login-left-bg" aria-hidden="true" />
        <video src={loginWaveform} autoPlay loop muted className="login-waveform" aria-hidden="true" />
        <div className="login-left-overlay" aria-hidden="true" />

        <div className="login-left-content">
          <h1 className="login-title">
            CELEBRATING THE<br />
             <span className="login-title-accent">PEOPLE</span>
          </h1>
          <p className="login-tagline">
            Pakistan Influencer Awards recognizes creators, storytellers, and
communities who inspire, entertain, and drive impact

          </p>
          {/* <div className="login-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="login-feature">
                <div className="login-feature-icon-box">
                  <i className={`bi ${f.icon}`} />
                </div>
                <div className="login-feature-body">
                  <p className="login-feature-title">{f.title}</p>
                  <p className="login-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-wrap">

          {/* Logo */}
          <div className="login-logo-section">
            <img src={logo} width={200}></img>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {error && (
              <div className="login-error">
                <i className="bi bi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label htmlFor="lf-email" className="login-field-label">Email</label>
              <div className="login-input-wrap">
                <i className="bi bi-envelope login-input-icon" />
                <input
                  type="email"
                  id="lf-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="lf-password" className="login-field-label">Password</label>
              <div className="login-input-wrap">
                <i className="bi bi-lock login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="lf-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            {/* Remember + Forgot row */}
            <div className="login-meta-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="login-checkbox-box" />
                <span>Remember me</span>
              </label>
              <a href="#" className="login-forgot-link">Forgot password?</a>
            </div>

            {/* Sign in */}
            <button type="submit" className="login-btn-signin" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}
