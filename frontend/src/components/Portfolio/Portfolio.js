import React from 'react';
import { useApp } from '../../context/AppContext';
import { fmtMoney, getAssetCurrentINR } from '../../utils/constants';

const TYPE_ICONS = { crypto:'🪙', stock:'📈', mutual_fund:'💼', etf:'📊', bond:'🏛️' };
const COLORS = ['#3b82f6','#10b981','#f59e0b','#a855f7','#f43f5e','#06b6d4','#ec4899','#6366f1','#84cc16','#fb923c'];

export default function Portfolio({ onOpenModal }) {
  const { portfolio, cryptoPrices, rates, currency, deleteAsset, fetchCryptoPrices } = useApp();
  const fmt = v => fmtMoney(v, currency, rates);

  const assets = portfolio.map((a, i) => {
    const cur = getAssetCurrentINR(a, cryptoPrices, rates);
    const val = cur * a.qty;
    const cost = a.buyPrice * a.qty;
    const pnl = val - cost;
    const pnlPct = cost > 0 ? pnl / cost * 100 : 0;
    const p = cryptoPrices[a.coinId];
    const dayChg = p?.usd_24h_change || 0;
    return { ...a, cur, val, cost, pnl, pnlPct, dayChg, color: COLORS[i % COLORS.length] };
  });

  const totalVal  = assets.reduce((s, a) => s + a.val, 0);
  const totalCost = assets.reduce((s, a) => s + a.cost, 0);
  const totalPnl  = totalVal - totalCost;
  const totalPnlPct = totalCost > 0 ? totalPnl / totalCost * 100 : 0;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">Live prices · refresh every 10s</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={fetchCryptoPrices}>↻ Refresh</button>
          <button className="btn btn-primary" onClick={() => onOpenModal('investment')}>+ Add Asset</button>
        </div>
      </div>

      <div className="portfolio-summary mb-22">
        <div className="ps-item"><div className="ps-label">Invested</div><div className="ps-val">{fmt(totalCost)}</div></div>
        <div className="ps-item"><div className="ps-label">Current Value</div><div className="ps-val">{fmt(totalVal)}</div></div>
        <div className="ps-item"><div className="ps-label">Total P&L</div><div className="ps-val" style={{color: totalPnl>=0?'var(--success)':'var(--danger)'}}>{totalPnl>=0?'+':''}{fmt(totalPnl)}</div></div>
        <div className="ps-item"><div className="ps-label">P&L %</div><div className="ps-val" style={{color: totalPnlPct>=0?'var(--success)':'var(--danger)'}}>{totalPnlPct>=0?'+':''}{totalPnlPct.toFixed(2)}%</div></div>
        <div className="ps-item"><div className="ps-label">Assets</div><div className="ps-val">{assets.length}</div></div>
      </div>

      <div className="card mb-22">
        <div className="card-header">
          <div className="card-title">Holdings</div>
          <div className="live-dot">Live</div>
        </div>
        {assets.length === 0
          ? <div className="empty-state"><div className="big">📊</div><p>Add your first asset to start tracking!</p></div>
          : <div className="scrollable">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th><th>Type</th><th>Qty</th>
                  <th>Buy Price</th><th>Current</th><th>Value</th>
                  <th>P&L</th><th>24h</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div className="asset-cell">
                        <div className="asset-icon" style={{background: a.color+'22', color: a.color}}>{TYPE_ICONS[a.type] || '💼'}</div>
                        <div><div className="asset-name">{a.name}</div><div className="asset-sym">{a.symbol}</div></div>
                      </div>
                    </td>
                    <td><span className="tag tag-investment">{a.type}</span></td>
                    <td className="num">{a.qty}</td>
                    <td className="num">{fmt(a.buyPrice)}</td>
                    <td className="num">{fmt(a.cur)}</td>
                    <td className="num fw-7">{fmt(a.val)}</td>
                    <td>
                      <span className={`chg-pill ${a.pnl>=0?'pos':'neg'}`}>{a.pnl>=0?'+':''}{fmt(a.pnl)}</span>
                      <div className="num" style={{fontSize:11, color:'var(--text-2)'}}>{a.pnlPct>=0?'+':''}{a.pnlPct.toFixed(2)}%</div>
                    </td>
                    <td><span className={`chg-pill ${a.dayChg>=0?'pos':'neg'}`}>{a.dayChg>=0?'▲':'▼'}{Math.abs(a.dayChg).toFixed(2)}%</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="icon-btn" onClick={() => onOpenModal('investment', a)}>✏️</button>
                        <button className="icon-btn del" onClick={() => { if(window.confirm('Remove this asset?')) deleteAsset(a._id); }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}
