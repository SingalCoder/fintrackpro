import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { fmtMoney, getAssetCurrentINR, CAT_ICONS, CAT_COLORS, getGreeting } from '../../utils/constants';

Chart.register(...registerables);

function StatCard({ label, value, change, sub, colorClass, icon, iconStyle }) {
  const pos = change >= 0;
  return (
    <div className={`stat-card ${colorClass || ''}`}>
      <div className="stat-head">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={iconStyle}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <span className={`stat-change ${pos ? 'pos' : 'neg'}`}>{pos ? '+' : ''}{change?.toFixed(1)}%</span>
      <p className="stat-sub">{sub}</p>
    </div>
  );
}

export default function Dashboard({ onOpenModal }) {
  const { transactions, portfolio, currency, rates, cryptoPrices, user, setCurrentPage } = useApp();
  const lineRef = useRef(null); const donutRef = useRef(null); const barRef = useRef(null);
  const lineChart = useRef(null); const donutChart = useRef(null); const barChart = useRef(null);

  const fmt = (v) => fmtMoney(v, currency, rates);

  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  const lm = cm === 0 ? 11 : cm - 1, ly = cm === 0 ? cy - 1 : cy;

  const monthTotals = (m, y) => transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === m && d.getFullYear() === y;
  }).reduce((a, t) => {
    if (t.type === 'income') a.inc += t.amt;
    else if (t.type === 'expense') a.exp += t.amt;
    return a;
  }, { inc: 0, exp: 0 });

  const curr = monthTotals(cm, cy), prev = monthTotals(lm, ly);
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  const balance = totalInc - totalExp;
  let portValue = 0, portCost = 0;
  portfolio.forEach(a => { portValue += getAssetCurrentINR(a, cryptoPrices, rates) * a.qty; portCost += a.buyPrice * a.qty; });

  const incChg  = prev.inc  > 0 ? (curr.inc  - prev.inc)  / prev.inc  * 100 : 0;
  const expChg  = prev.exp  > 0 ? (curr.exp  - prev.exp)  / prev.exp  * 100 : 0;
  const portChg = portCost  > 0 ? (portValue - portCost)  / portCost  * 100 : 0;

  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gc = () => ({ grid: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', text: dark ? '#7c91ab' : '#64748b' });

  useEffect(() => {
    if (!lineRef.current) return;
    if (lineChart.current) lineChart.current.destroy();
    const ctx = lineRef.current.getContext('2d');
    const labels = [], data = [];
    let base = portCost || 350000;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
      base += (Math.random() - 0.42) * base * 0.022;
      data.push(+base.toFixed(0));
    }
    if (portValue > 0) data[data.length - 1] = portValue;
    const { grid, text } = gc();
    const grad = ctx.createLinearGradient(0, 0, 0, 210);
    grad.addColorStop(0, 'rgba(59,130,246,0.35)'); grad.addColorStop(1, 'rgba(59,130,246,0)');
    lineChart.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ data, borderColor: '#3b82f6', backgroundColor: grad, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.parsed.y) } } },
        scales: { x: { grid: { color: grid }, ticks: { color: text, maxTicksLimit: 6, maxRotation: 0 } }, y: { grid: { color: grid }, ticks: { color: text, callback: v => fmt(v) } } } }
    });
  }, [portfolio, cryptoPrices]); // eslint-disable-line

  useEffect(() => {
    if (!donutRef.current) return;
    if (donutChart.current) donutChart.current.destroy();
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.cat] = (cats[t.cat] || 0) + t.amt; });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!sorted.length) return;
    const { text } = gc();
    donutChart.current = new Chart(donutRef.current.getContext('2d'), {
      type: 'doughnut',
      data: { labels: sorted.map(([k]) => k), datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: sorted.map(([k]) => CAT_COLORS[k] || '#94a3b8'), borderWidth: 2, borderColor: 'transparent', hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: text, padding: 12, boxWidth: 12, font: { size: 11 } } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.parsed)}` } } },
        cutout: '68%' }
    });
  }, [transactions]); // eslint-disable-line

  useEffect(() => {
    if (!barRef.current) return;
    if (barChart.current) barChart.current.destroy();
    const months = [], incArr = [], expArr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth(), y = d.getFullYear();
      months.push(d.toLocaleDateString('en', { month: 'short' }));
      incArr.push(transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + t.amt, 0));
      expArr.push(transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + t.amt, 0));
    }
    const { grid, text } = gc();
    barChart.current = new Chart(barRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels: months, datasets: [
        { label: 'Income', data: incArr, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false },
        { label: 'Expenses', data: expArr, backgroundColor: 'rgba(244,63,94,0.8)', borderRadius: 6, borderSkipped: false },
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: text, padding: 12, boxWidth: 12 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.parsed.y)}` } } },
        scales: { x: { grid: { display: false }, ticks: { color: text } }, y: { grid: { color: grid }, ticks: { color: text, callback: v => fmt(v) } } } }
    });
  }, [transactions]); // eslint-disable-line

  const recentTxns = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const topAssets = [...portfolio].map(a => ({
    ...a,
    cur: getAssetCurrentINR(a, cryptoPrices, rates),
    val: getAssetCurrentINR(a, cryptoPrices, rates) * a.qty,
  })).sort((a, b) => b.val - a.val).slice(0, 5);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => onOpenModal('transaction')}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Transaction
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Balance" value={fmt(balance)} change={0} sub="all time" icon="💳" iconStyle={{background:'var(--accent-dim)',color:'var(--accent)'}} />
        <StatCard label="Monthly Income" value={fmt(curr.inc)} change={incChg} sub="this month" colorClass="success" icon="💰" iconStyle={{background:'var(--success-bg)',color:'var(--success)'}} />
        <StatCard label="Monthly Expenses" value={fmt(curr.exp)} change={-expChg} sub="this month" colorClass="danger" icon="📊" iconStyle={{background:'var(--danger-bg)',color:'var(--danger)'}} />
        <StatCard label="Portfolio Value" value={fmt(portValue)} change={portChg} sub="total P&L live" colorClass="gold" icon="📈" iconStyle={{background:'var(--gold-dim)',color:'var(--gold)'}} />
      </div>

      <div className="chart-grid mb-22">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Portfolio Growth</div><div className="card-subtitle">30-day performance</div></div>
            <span className="badge" style={{color: portChg >= 0 ? 'var(--success)' : 'var(--danger)', background: portChg >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)'}}>
              {portChg >= 0 ? '+' : ''}{portChg.toFixed(2)}%
            </span>
          </div>
          <div className="chart-wrap"><canvas ref={lineRef}></canvas></div>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Spending</div><div className="card-subtitle">by category</div></div></div>
          <div className="chart-wrap"><canvas ref={donutRef}></canvas></div>
        </div>
      </div>

      <div className="chart-grid-3 mb-22">
        <div className="card" style={{gridColumn:'span 2'}}>
          <div className="card-header"><div><div className="card-title">Income vs Expenses</div><div className="card-subtitle">last 6 months</div></div></div>
          <div className="chart-wrap"><canvas ref={barRef}></canvas></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Top Holdings</div></div>
          {topAssets.length === 0 ? <div className="empty-state"><div className="big">📊</div><p>No assets yet</p></div> : topAssets.map(a => (
            <div key={a._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18}}>{a.type==='crypto'?'🪙':a.type==='stock'?'📈':'💼'}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>{a.symbol}</div>
                  <div style={{fontSize:11,color:'var(--text-2)'}}>{a.type}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'DM Mono',fontSize:12.5}}>{fmt(a.val)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Transactions</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage('transactions')}>View All</button>
        </div>
        {recentTxns.length === 0 ? <div className="empty-state"><div className="big">💸</div><p>No transactions yet</p></div> : recentTxns.map(t => (
          <div className="txn-row" key={t._id}>
            <div className="txn-icon" style={{background: t.type==='income' ? 'var(--success-bg)' : t.type==='expense' ? 'var(--danger-bg)' : 'var(--gold-dim)'}}>{CAT_ICONS[t.cat] || '📦'}</div>
            <div className="txn-info">
              <div className="txn-name">{t.desc}</div>
              <div className="txn-meta">{t.cat} · {t.date}</div>
            </div>
            <div className="txn-amount" style={{color: t.type==='income' ? 'var(--success)' : t.type==='expense' ? 'var(--danger)' : 'var(--gold)'}}>
              {t.type==='income' ? '+' : '-'}{fmt(t.amt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
