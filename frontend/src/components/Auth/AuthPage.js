import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AuthPage() {
  const { login, register } = useApp();
  const [tab, setTab] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regCurrency, setRegCurrency] = useState('INR');

  const handleLogin = async () => {
    if (!loginEmail || !loginPw) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      await login(loginEmail, loginPw);
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPw) { setError('Please fill in all fields.'); return; }
    if (regPw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await register(regName, regEmail, regPw, regCurrency);
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const onKey = (e, fn) => { if (e.key === 'Enter') fn(); };

  return (
    <div className="auth-screen">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="auth-logo-mark">F</div>
          <h1>Fin<span>Track</span> Pro</h1>
          <p>Your intelligent personal finance dashboard</p>
        </div>
        <div className="auth-card">
          <div className="auth-tabs">
            <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</div>
            <div className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Create Account</div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {tab === 'login' ? (
            <div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">✉️</span>
                  <input type="email" className="form-input" placeholder="you@example.com"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    onKeyDown={e => onKey(e, handleLogin)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap" style={{position:'relative'}}>
                  <span className="input-icon">🔒</span>
                  <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Enter your password"
                    value={loginPw} onChange={e => setLoginPw(e.target.value)}
                    onKeyDown={e => onKey(e, handleLogin)} />
                  <button className="pw-toggle" onClick={() => setShowPw(p => !p)} type="button">{showPw ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <button className="btn-auth" onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
              <div className="demo-hint">
                💡 <strong>Demo:</strong> Sign up with any email & password (min 6 chars) to get started with sample data!
              </div>
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">👤</span>
                  <input type="text" className="form-input" placeholder="Arjun Sharma"
                    value={regName} onChange={e => setRegName(e.target.value)}
                    onKeyDown={e => onKey(e, handleRegister)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">✉️</span>
                  <input type="email" className="form-input" placeholder="you@example.com"
                    value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    onKeyDown={e => onKey(e, handleRegister)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap" style={{position:'relative'}}>
                  <span className="input-icon">🔒</span>
                  <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters"
                    value={regPw} onChange={e => setRegPw(e.target.value)}
                    onKeyDown={e => onKey(e, handleRegister)} />
                  <button className="pw-toggle" onClick={() => setShowPw(p => !p)} type="button">{showPw ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select className="form-select" value={regCurrency} onChange={e => setRegCurrency(e.target.value)}>
                  <option value="INR">🇮🇳 Indian Rupee (INR)</option>
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="GBP">🇬🇧 British Pound (GBP)</option>
                  <option value="AED">🇦🇪 UAE Dirham (AED)</option>
                  <option value="SGD">🇸🇬 Singapore Dollar (SGD)</option>
                </select>
              </div>
              <button className="btn-auth" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
