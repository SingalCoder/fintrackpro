import React from 'react';
import { useApp } from '../../context/AppContext';

const NAV = [
  { page: 'dashboard',    label: 'Dashboard',          section: 'Overview',
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { page: 'portfolio',    label: 'Portfolio',           section: null,
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> },
  { page: 'transactions', label: 'Transactions',        section: 'Finance',
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7h12m0 0l-4-4m4 4l-4 4M4 17h12m0 0l-4-4m4 4l-4 4"/></svg> },
  { page: 'budgets',      label: 'Budgets',             section: null,
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 7c0-1.1.9-2 2-2h2a2 2 0 012 2v0M9 7h8"/></svg> },
  { page: 'analytics',    label: 'Analytics',           section: null,
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { page: 'tools',        label: 'Tools & Calculators', section: 'Tools',
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg> },
];

export default function Sidebar({ open, onClose }) {
  const { user, currentPage, setCurrentPage, currency, setCurrency, theme, toggleTheme, logout, liveStatus } = useApp();

  const navigate = (page) => { setCurrentPage(page); onClose(); };
  let lastSection = null;

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="logo">
        <div className="logo-mark">F</div>
        <span className="logo-text">Fin<span>Track</span> Pro</span>
      </div>

      {user && (
        <div className="user-card">
          <div className="user-avatar" style={{background:`linear-gradient(135deg,var(--accent),#7c3aed)`}}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      )}

      {NAV.map(item => {
        const showSection = item.section && item.section !== lastSection;
        if (item.section) lastSection = item.section;
        return (
          <React.Fragment key={item.page}>
            {showSection && (
              <div className="nav-section">
                <div className="nav-label">{item.section}</div>
              </div>
            )}
            <div className={`nav-item${currentPage === item.page ? ' active' : ''}`} onClick={() => navigate(item.page)}>
              {item.icon} {item.label}
            </div>
          </React.Fragment>
        );
      })}

      <div className="sidebar-footer">
        <div className="currency-selector">
          <span>💱</span>
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="INR">🇮🇳 INR</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="EUR">🇪🇺 EUR</option>
            <option value="GBP">🇬🇧 GBP</option>
            <option value="AED">🇦🇪 AED</option>
            <option value="JPY">🇯🇵 JPY</option>
            <option value="SGD">🇸🇬 SGD</option>
          </select>
        </div>
        <div className="live-dot">{liveStatus}</div>
        <div className="theme-toggle" onClick={toggleTheme}>
          <div className="toggle-track"><div className="toggle-thumb"></div></div>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>
        <div className="logout-btn" onClick={logout}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign Out
        </div>
      </div>
    </aside>
  );
}
