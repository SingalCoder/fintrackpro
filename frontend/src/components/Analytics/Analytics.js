import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { fmtMoney, CAT_ICONS, CAT_COLORS } from '../../utils/constants';

Chart.register(...registerables);

export default function Analytics() {
  const { transactions, currency, rates } = useApp();
  const trendRef = useRef(null); const savingsRef = useRef(null);
  const trendChart = useRef(null); const savingsChart = useRef(null);
  const fmt = v => fmtMoney(v, currency, rates);
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gc = () => ({ grid: dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)', text: dark?'#7c91ab':'#64748b' });

  useEffect(() => {
    if (!trendRef.current) return;
    if (trendChart.current) trendChart.current.destroy();
    const months = [], data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth()-i);
      months.push(d.toLocaleDateString('en',{month:'short'}));
      data.push(transactions.filter(t=>t.type==='expense'&&new Date(t.date).getMonth()===d.getMonth()&&new Date(t.date).getFullYear()===d.getFullYear()).reduce((s,t)=>s+t.amt,0));
    }
    const {grid,text}=gc();
    trendChart.current = new Chart(trendRef.current.getContext('2d'),{
      type:'line', data:{labels:months,datasets:[{label:'Spending',data,borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.15)',borderWidth:2,fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#f59e0b'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y)}}},
        scales:{x:{grid:{color:grid},ticks:{color:text}},y:{grid:{color:grid},ticks:{color:text,callback:v=>fmt(v)}}}}
    });
  }, [transactions]); // eslint-disable-line

  useEffect(() => {
    if (!savingsRef.current) return;
    if (savingsChart.current) savingsChart.current.destroy();
    const months = [], data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth()-i);
      months.push(d.toLocaleDateString('en',{month:'short'}));
      const inc = transactions.filter(t=>t.type==='income'&&new Date(t.date).getMonth()===d.getMonth()&&new Date(t.date).getFullYear()===d.getFullYear()).reduce((s,t)=>s+t.amt,0);
      const exp = transactions.filter(t=>t.type==='expense'&&new Date(t.date).getMonth()===d.getMonth()&&new Date(t.date).getFullYear()===d.getFullYear()).reduce((s,t)=>s+t.amt,0);
      data.push(inc > 0 ? Math.max(0,(inc-exp)/inc*100) : 0);
    }
    const {grid,text}=gc();
    savingsChart.current = new Chart(savingsRef.current.getContext('2d'),{
      type:'bar', data:{labels:months,datasets:[{label:'Savings Rate %',data,backgroundColor:'rgba(59,130,246,0.75)',borderRadius:6}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.y.toFixed(1)}%`}}},
        scales:{x:{grid:{display:false},ticks:{color:text}},y:{grid:{color:grid},ticks:{color:text,callback:v=>v+'%'},max:100}}}
    });
  }, [transactions]); // eslint-disable-line

  const cats = {};
  transactions.filter(t=>t.type==='expense').forEach(t=>{ cats[t.cat]=(cats[t.cat]||0)+t.amt; });
  const grand = Object.values(cats).reduce((s,v)=>s+v,0);
  const sorted = Object.entries(cats).sort((a,b)=>b[1]-a[1]);

  const now = new Date(); const m=now.getMonth(), y=now.getFullYear();
  const currExp = transactions.filter(t=>t.type==='expense'&&new Date(t.date).getMonth()===m&&new Date(t.date).getFullYear()===y).reduce((s,t)=>s+t.amt,0);
  const currInc = transactions.filter(t=>t.type==='income'&&new Date(t.date).getMonth()===m&&new Date(t.date).getFullYear()===y).reduce((s,t)=>s+t.amt,0);
  const topCat = sorted[0];

  const insights = [
    { icon:'💰', title:'Monthly Savings', sub:`You saved ${fmt(Math.max(0,currInc-currExp))} this month`, bg:'var(--success-bg)' },
    { icon:'📊', title:'Top Expense', sub: topCat ? `${CAT_ICONS[topCat[0]]} ${topCat[0]} — ${fmt(topCat[1])}` : 'No expenses yet', bg:'var(--danger-bg)' },
    { icon:'📈', title:'Savings Rate', sub: currInc>0?`${((Math.max(0,currInc-currExp)/currInc)*100).toFixed(1)}% of income saved`:'Add income to calculate', bg:'var(--accent-dim)' },
  ];

  return (
    <div>
      <div className="topbar">
        <div><h1 className="page-title">Analytics</h1><p className="page-subtitle">Spending insights & smart trends</p></div>
      </div>

      <div className="section-title mb-16">💡 Smart Insights</div>
      <div style={{display:'flex',gap:14,marginBottom:22,flexWrap:'wrap'}}>
        {insights.map((ins,i) => (
          <div key={i} className="insight-card" style={{flex:'1',minWidth:200}}>
            <div className="insight-item" style={{borderBottom:'none',paddingBottom:0}}>
              <div className="insight-icon" style={{background:ins.bg}}>{ins.icon}</div>
              <div><div className="insight-title">{ins.title}</div><div className="insight-sub">{ins.sub}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="insights-grid mb-22">
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Spending Trend</div></div>
          <div className="chart-wrap"><canvas ref={trendRef}></canvas></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Category Breakdown</div></div>
          <div style={{maxHeight:300,overflowY:'auto'}}>
            {sorted.length === 0 ? <div className="empty-state" style={{padding:'20px'}}><p>No expense data yet</p></div>
            : sorted.map(([cat,amt]) => {
              const pct = grand>0?amt/grand*100:0;
              return (
                <div key={cat} style={{padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:13,fontWeight:700}}>{CAT_ICONS[cat]||'📦'} {cat}</span>
                    <span className="mono" style={{fontSize:12.5}}>{fmt(amt)} <span style={{color:'var(--text-3)',fontSize:10}}>({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="spending-bar"><div className="spending-fill" style={{width:`${pct.toFixed(0)}%`,background:CAT_COLORS[cat]||'var(--accent)'}}></div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Savings Rate by Month</div></div>
        <div className="chart-wrap"><canvas ref={savingsRef}></canvas></div>
      </div>
    </div>
  );
}
