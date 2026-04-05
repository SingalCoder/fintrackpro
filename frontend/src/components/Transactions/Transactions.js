import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fmtMoney, CAT_ICONS } from '../../utils/constants';

export default function Transactions({ onOpenModal }) {
  const { transactions, currency, rates, deleteTransaction, toast } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const fmt = v => fmtMoney(v, currency, rates);

  const filtered = transactions.filter(t => {
    if (search && !t.desc.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && t.type !== filterType) return false;
    if (filterCat && t.cat !== filterCat) return false;
    if (filterMonth && !t.date.startsWith(filterMonth)) return false;
    return true;
  });

  const exportCSV = () => {
    const rows = [['Date','Type','Category','Description','Amount (INR)','Notes']];
    transactions.forEach(t => rows.push([t.date,t.type,t.cat,t.desc,t.amt,t.notes||'']));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'fintrack_transactions.csv'; a.click();
    toast('CSV exported ✓', 'success');
  };

  const totalInc = filtered.filter(t=>t.type==='income').reduce((s,t)=>s+t.amt,0);
  const totalExp = filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amt,0);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} transactions · Income {fmt(totalInc)} · Expenses {fmt(totalExp)}</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>↓ Export CSV</button>
          <button className="btn btn-primary" onClick={() => onOpenModal('transaction')}>+ Add Transaction</button>
        </div>
      </div>

      <div className="card mb-22">
        <div className="filters-bar">
          <div className="search-inline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search transactions…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
          </select>
          <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {['food','transport','utilities','entertainment','shopping','salary','freelance','investment','health','education','other'].map(c => (
              <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
            ))}
          </select>
          <input type="month" className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterType(''); setFilterCat(''); setFilterMonth(''); }}>Clear</button>
        </div>

        {filtered.length === 0
          ? <div className="empty-state"><div className="big">💸</div><p>No transactions found.</p></div>
          : filtered.map(t => (
            <div className="txn-row" key={t._id}>
              <div className="txn-icon" style={{background: t.type==='income' ? 'var(--success-bg)' : t.type==='expense' ? 'var(--danger-bg)' : 'var(--gold-dim)'}}>{CAT_ICONS[t.cat] || '📦'}</div>
              <div className="txn-info">
                <div className="txn-name">{t.desc}</div>
                <div className="txn-meta">
                  <span className={`tag tag-${t.type}`}>{t.type}</span> · {t.cat} · {t.date}
                  {t.notes && <span> · {t.notes}</span>}
                </div>
              </div>
              <div className="txn-amount" style={{color: t.type==='income'?'var(--success)':t.type==='expense'?'var(--danger)':'var(--gold)'}}>
                {t.type==='income'?'+':'-'}{fmt(t.amt)}
              </div>
              <div className="txn-actions">
                <button className="icon-btn" onClick={() => onOpenModal('transaction', t)} title="Edit">✏️</button>
                <button className="icon-btn del" onClick={() => { if(window.confirm('Delete this transaction?')) deleteTransaction(t._id); }} title="Delete">🗑️</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
