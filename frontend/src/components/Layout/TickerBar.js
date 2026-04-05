import React from 'react';
import { useApp } from '../../context/AppContext';

const COINS = [
  {sym:'BTC',id:'bitcoin'},{sym:'ETH',id:'ethereum'},{sym:'BNB',id:'binancecoin'},
  {sym:'SOL',id:'solana'},{sym:'DOGE',id:'dogecoin'},{sym:'XRP',id:'ripple'},{sym:'ADA',id:'cardano'},
];

export default function TickerBar() {
  const { cryptoPrices } = useApp();

  const items = COINS.map(c => {
    const p = cryptoPrices[c.id];
    if (!p) return null;
    const chg = p.usd_24h_change || 0;
    const cls = chg >= 0 ? 'pos' : 'neg';
    const arr = chg >= 0 ? '▲' : '▼';
    return (
      <span className="ticker-item" key={c.sym}>
        <span className="t-sym">{c.sym}</span>
        <span className="t-price">${p.usd?.toLocaleString('en', {maximumFractionDigits: p.usd < 1 ? 4 : 2})}</span>
        <span className={`t-chg ${cls}`}>{arr}{Math.abs(chg).toFixed(2)}%</span>
        <span className="ticker-dot"></span>
      </span>
    );
  }).filter(Boolean);

  if (!items.length) return <div className="ticker-bar"><div className="ticker-track" style={{padding:'0 20px',fontSize:12,color:'var(--text-2)'}}>Loading live prices…</div></div>;

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {items}{items}
      </div>
    </div>
  );
}
