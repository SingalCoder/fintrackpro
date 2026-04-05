import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fmtMoney, CURRENCY_SYMBOLS } from '../../utils/constants';

const NEWS = [
  {title:'RBI holds repo rate steady at 6.5% amid easing inflation data',time:'1h ago',tag:'Macro',color:'var(--accent)'},
  {title:'Sensex rises 400 pts; IT & Pharma lead gains on strong earnings',time:'3h ago',tag:'Markets',color:'var(--success)'},
  {title:'Bitcoin consolidates above $83K; crypto market cap at $3.1T',time:'4h ago',tag:'Crypto',color:'var(--gold)'},
  {title:'SEBI proposes stricter disclosure norms for SME IPOs',time:'6h ago',tag:'Regulatory',color:'var(--purple)'},
  {title:"India's UPI crosses 20 billion monthly transactions milestone",time:'9h ago',tag:'Fintech',color:'var(--cyan)'},
  {title:'Gold hits record high of ₹72,000/10g amid global uncertainty',time:'12h ago',tag:'Commodities',color:'var(--warning)'},
];

export default function Tools({ onOpenModal }) {
  const { goals, deleteGoal, currency, rates, cryptoPrices } = useApp();
  const fmt = v => fmtMoney(v, currency, rates);
  const sym = c => CURRENCY_SYMBOLS[c] || c + ' ';

  // SIP
  const [sipAmt, setSipAmt]     = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate]   = useState(12);
  const n = sipYears*12, r = sipRate/100/12;
  const fv = sipAmt*((Math.pow(1+r,n)-1)/r)*(1+r);
  const sipInv = sipAmt*n;

  // Converter
  const [convAmt, setConvAmt]   = useState(1000);
  const [convFrom, setConvFrom] = useState('INR');
  const [convTo, setConvTo]     = useState('USD');

  const getCryptoUSD = id => cryptoPrices[id]?.usd;
  let fromUSD;
  if (convFrom==='BTC') fromUSD = getCryptoUSD('bitcoin')||83500;
  else if (convFrom==='ETH') fromUSD = getCryptoUSD('ethereum')||3250;
  else fromUSD = 1/(rates[convFrom]||1);
  const toRate = rates[convTo]||1;
  const convResult = convAmt*fromUSD*toRate;
  const convRate = fromUSD*toRate;
  const fmtConv = v => v>=1e6?v.toLocaleString('en',{maximumFractionDigits:2}):v>=1?v.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:4}):v.toFixed(6);

  const currencies = ['INR','USD','EUR','GBP','AED','JPY','SGD'];

  return (
    <div>
      <div className="topbar"><div><h1 className="page-title">Tools & Calculators</h1></div></div>

      <div className="tools-grid mb-22">
        {/* Currency Converter */}
        <div className="card">
          <div className="card-header"><div><div className="card-title">💱 Currency Converter</div><div className="card-subtitle">Live exchange rates</div></div></div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input type="number" className="form-input" value={convAmt} onChange={e=>setConvAmt(+e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From</label>
              <select className="form-select" value={convFrom} onChange={e=>setConvFrom(e.target.value)}>
                {[...currencies,'BTC','ETH'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <select className="form-select" value={convTo} onChange={e=>setConvTo(e.target.value)}>
                {currencies.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="converter-result">
            <div className="text-muted" style={{fontSize:12,marginBottom:4}}>{convAmt.toLocaleString()} {convFrom} =</div>
            <div className="big-num">{sym(convTo)}{fmtConv(convResult)}</div>
            <div className="text-muted" style={{fontSize:12,marginTop:8}}>1 {convFrom} = {fmtConv(convRate)} {convTo}</div>
          </div>
        </div>

        {/* SIP Calculator */}
        <div className="card">
          <div className="card-header"><div><div className="card-title">📈 SIP Calculator</div><div className="card-subtitle">Systematic Investment Plan</div></div></div>
          <div className="form-group">
            <label className="form-label">Monthly SIP ({sym(currency)})</label>
            <input type="number" className="form-input" value={sipAmt} onChange={e=>setSipAmt(+e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (Years)</label>
              <input type="number" className="form-input" value={sipYears} min="1" max="40" onChange={e=>setSipYears(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Return %</label>
              <input type="number" className="form-input" value={sipRate} min="1" onChange={e=>setSipRate(+e.target.value)} />
            </div>
          </div>
          <div className="sip-result">
            <div className="sip-cell"><div className="sip-label">Invested</div><div className="sip-val">{fmt(sipInv)}</div></div>
            <div className="sip-cell"><div className="sip-label">Returns</div><div className="sip-val text-success">{fmt(fv-sipInv)}</div></div>
            <div className="sip-cell"><div className="sip-label">Total</div><div className="sip-val text-gold">{fmt(fv)}</div></div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="card mb-22">
        <div className="card-header">
          <div><div className="card-title">🎯 Goal Tracker</div><div className="card-subtitle">Track your savings milestones</div></div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenModal('goal')}>+ Add Goal</button>
        </div>
        {goals.length === 0
          ? <div className="empty-state"><div className="big">🎯</div><p>Set a savings goal to start tracking!</p></div>
          : goals.map(g => {
            const pct = g.target>0?Math.min(g.saved/g.target*100,100):0;
            const left = g.target-g.saved;
            const days = g.targetDate ? Math.ceil((new Date(g.targetDate)-new Date())/(864e5)) : null;
            return (
              <div className="goal-item" key={g._id}>
                <div className="goal-head">
                  <div className="goal-name">{g.icon} {g.name}</div>
                  <div className="goal-amounts">
                    {fmt(g.saved)} / {fmt(g.target)}
                    <button className="icon-btn del" onClick={() => { if(window.confirm('Remove goal?')) deleteGoal(g._id); }}>🗑️</button>
                  </div>
                </div>
                <div className="goal-bar"><div className="goal-fill" style={{width:`${pct.toFixed(1)}%`}}></div></div>
                <div className="goal-meta">
                  <span>{pct.toFixed(1)}% · {fmt(left)} remaining</span>
                  {days !== null && <span>{days > 0 ? `${days} days left` : '🎉 Goal reached!'}</span>}
                </div>
              </div>
            );
          })
        }
      </div>

      {/* News */}
      <div className="card">
        <div className="card-header"><div className="card-title">📰 Market Insights</div><div className="badge">Live Feed</div></div>
        {NEWS.map((n,i) => (
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'13px 0',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:10.5,fontWeight:700,padding:'3px 8px',borderRadius:6,background:`${n.color}22`,color:n.color,whiteSpace:'nowrap',marginTop:2}}>{n.tag}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,lineHeight:1.5}}>{n.title}</div>
              <div style={{fontSize:11,color:'var(--text-2)',marginTop:3}}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
