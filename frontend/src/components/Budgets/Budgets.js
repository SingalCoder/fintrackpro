import React from 'react';
import { useApp } from '../../context/AppContext';
import { fmtMoney, CAT_ICONS, CAT_COLORS } from '../../utils/constants';

export default function Budgets({ onOpenModal }) {
  const { budgets, transactions, currency, rates, deleteBudget } = useApp();
  const fmt = v => fmtMoney(v, currency, rates);

  const now = new Date(); const m = now.getMonth(), y = now.getFullYear();
  const monthExp = cat => transactions.filter(t =>
    t.type==='expense' && t.cat===cat &&
    new Date(t.date).getMonth()===m && new Date(t.date).getFullYear()===y
  ).reduce((s,t) => s+t.amt, 0);

  const totalBudgeted = budgets.reduce((s,b) => s+b.limit, 0);
  const totalSpent    = budgets.reduce((s,b) => s+monthExp(b.cat), 0);
  const totalLeft     = totalBudgeted - totalSpent;
  const overCount     = budgets.filter(b => monthExp(b.cat) > b.limit).length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Monthly spending limits</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => onOpenModal('budget')}>+ New Budget</button>
        </div>
      </div>

      <div className="stats-grid mb-22">
        <div className="stat-card">
          <div className="stat-head"><span className="stat-label">Total Budgeted</span><div className="stat-icon" style={{background:'var(--accent-dim)',color:'var(--accent)'}}>🎯</div></div>
          <div className="stat-value">{fmt(totalBudgeted)}</div>
          <p className="stat-sub">this month</p>
        </div>
        <div className="stat-card success">
          <div className="stat-head"><span className="stat-label">Spent So Far</span><div className="stat-icon" style={{background:'var(--success-bg)',color:'var(--success)'}}>💸</div></div>
          <div className="stat-value">{fmt(totalSpent)}</div>
          <p className="stat-sub">across all categories</p>
        </div>
        <div className="stat-card danger">
          <div className="stat-head"><span className="stat-label">Remaining</span><div className="stat-icon" style={{background:'var(--danger-bg)',color:'var(--danger)'}}>💰</div></div>
          <div className="stat-value">{fmt(totalLeft)}</div>
          <p className="stat-sub">budget left</p>
        </div>
        <div className="stat-card gold">
          <div className="stat-head"><span className="stat-label">Over Budget</span><div className="stat-icon" style={{background:'var(--gold-dim)',color:'var(--gold)'}}>⚠️</div></div>
          <div className="stat-value">{overCount}</div>
          <p className="stat-sub">categories exceeded</p>
        </div>
      </div>

      <div className="section-title mb-16">Monthly Budgets</div>
      {budgets.length === 0
        ? <div className="empty-state"><div className="big">🎯</div><p>No budgets set. Create your first budget!</p></div>
        : <div className="budget-grid">
          {budgets.map(b => {
            const spent = monthExp(b.cat);
            const pct = b.limit > 0 ? Math.min(spent / b.limit * 100, 100) : 0;
            const fillClass = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
            return (
              <div className="budget-card" key={b._id}>
                <div className="budget-head">
                  <div className="budget-name" style={{color: CAT_COLORS[b.cat] || 'var(--accent)'}}>
                    <span>{CAT_ICONS[b.cat] || '📦'}</span> {b.cat}
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <div className="budget-amounts">{fmt(spent)} / {fmt(b.limit)}</div>
                    <button className="icon-btn" onClick={() => onOpenModal('budget', b)}>✏️</button>
                    <button className="icon-btn del" onClick={() => { if(window.confirm('Remove this budget?')) deleteBudget(b._id); }}>🗑️</button>
                  </div>
                </div>
                <div className="budget-bar"><div className={`budget-fill ${fillClass}`} style={{width:`${pct.toFixed(0)}%`}}></div></div>
                <div className="budget-meta">
                  <span>{pct.toFixed(0)}% used</span>
                  <span style={{color: fillClass==='over'?'var(--danger)':fillClass==='warn'?'var(--warning)':'var(--success)'}}>
                    {fillClass==='over' ? `${fmt(spent-b.limit)} over!` : `${fmt(b.limit-spent)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
