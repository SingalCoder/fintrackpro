import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CRYPTO_IDS } from '../../utils/constants';

function Modal({ id, open, onClose, children }) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">{children}</div>
    </div>
  );
}

/* ── Transaction Modal ── */
export function TransactionModal({ open, onClose, editData }) {
  const { addTransaction, updateTransaction } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ type:'expense', desc:'', amt:'', cat:'food', date:today, notes:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(editData
      ? { type:editData.type, desc:editData.desc, amt:editData.amt, cat:editData.cat, date:editData.date, notes:editData.notes||'' }
      : { type:'expense', desc:'', amt:'', cat:'food', date:today, notes:'' }
    );
  }, [open, editData]); // eslint-disable-line

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.desc || !form.amt || !form.date) return;
    setLoading(true);
    try {
      if (editData) await updateTransaction(editData._id, { ...form, amt: parseFloat(form.amt) });
      else await addTransaction({ ...form, amt: parseFloat(form.amt) });
      onClose();
    } finally { setLoading(false); }
  };

  const cats = ['food','transport','utilities','entertainment','shopping','salary','freelance','investment','health','education','other'];
  const catLabels = { food:'🍕 Food & Dining', transport:'🚗 Transport', utilities:'🔌 Utilities', entertainment:'🎬 Entertainment', shopping:'🛍️ Shopping', salary:'💼 Salary', freelance:'💻 Freelance', investment:'📈 Investment', health:'🏥 Health', education:'📚 Education', other:'📦 Other' };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div className="modal-title">{editData ? 'Edit Transaction' : 'Add Transaction'}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="investment">Investment</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input type="text" className="form-input" placeholder="e.g., Grocery shopping" value={form.desc} onChange={e => set('desc', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input type="number" className="form-input" placeholder="0.00" step="0.01" value={form.amt} onChange={e => set('amt', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.cat} onChange={e => set('cat', e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Date</label>
        <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Notes (Optional)</label>
        <input type="text" className="form-input" placeholder="Additional notes…" value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={loading || !form.desc || !form.amt || !form.date}>
          {loading ? 'Saving…' : 'Save Transaction'}
        </button>
      </div>
    </Modal>
  );
}

/* ── Investment Modal ── */
export function InvestmentModal({ open, onClose, editData }) {
  const { addAsset, updateAsset } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ type:'crypto', symbol:'', name:'', qty:'', buyPrice:'', date:today });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(editData
      ? { type:editData.type, symbol:editData.symbol, name:editData.name, qty:editData.qty, buyPrice:editData.buyPrice, date:editData.date }
      : { type:'crypto', symbol:'', name:'', qty:'', buyPrice:'', date:today }
    );
  }, [open, editData]); // eslint-disable-line

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const hints = {
    crypto: '💡 Supported: BTC, ETH, SOL, BNB, ADA, XRP, DOGE, MATIC, DOT, AVAX, LINK',
    stock: '💡 Examples: RELIANCE, TCS, INFY, HDFC, AAPL, GOOGL',
  };

  const save = async () => {
    if (!form.symbol || !form.qty || !form.buyPrice || !form.date) return;
    setLoading(true);
    const sym = form.symbol.toUpperCase();
    const coinId = form.type === 'crypto' ? (CRYPTO_IDS[sym] || sym.toLowerCase()) : null;
    try {
      const data = { ...form, symbol: sym, qty: parseFloat(form.qty), buyPrice: parseFloat(form.buyPrice), coinId };
      if (editData) await updateAsset(editData._id, data);
      else await addAsset(data);
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div className="modal-title">{editData ? 'Edit Asset' : 'Add Asset'}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="form-group">
        <label className="form-label">Asset Type</label>
        <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="crypto">Cryptocurrency</option>
          <option value="stock">Stock</option>
          <option value="mutual_fund">Mutual Fund</option>
          <option value="etf">ETF</option>
          <option value="bond">Bond</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Symbol</label>
          <input type="text" className="form-input" placeholder="BTC / RELIANCE" style={{textTransform:'uppercase'}}
            value={form.symbol} onChange={e => set('symbol', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input type="text" className="form-input" placeholder="Bitcoin" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input type="number" className="form-input" placeholder="0" step="0.000001" value={form.qty} onChange={e => set('qty', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Buy Price (₹)</label>
          <input type="number" className="form-input" placeholder="0.00" value={form.buyPrice} onChange={e => set('buyPrice', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Purchase Date</label>
        <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
      </div>
      {hints[form.type] && <p className="text-muted" style={{fontSize:12, marginBottom:12}}>{hints[form.type]}</p>}
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={loading || !form.symbol || !form.qty || !form.buyPrice}>
          {loading ? 'Saving…' : editData ? 'Update Asset' : 'Add Asset'}
        </button>
      </div>
    </Modal>
  );
}

/* ── Budget Modal ── */
export function BudgetModal({ open, onClose, editData }) {
  const { addBudget, updateBudget } = useApp();
  const [form, setForm] = useState({ cat:'food', limit:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(editData ? { cat:editData.cat, limit:editData.limit } : { cat:'food', limit:'' });
  }, [open, editData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.limit) return;
    setLoading(true);
    try {
      if (editData) await updateBudget(editData._id, { ...form, limit: parseFloat(form.limit) });
      else await addBudget({ ...form, limit: parseFloat(form.limit) });
      onClose();
    } finally { setLoading(false); }
  };

  const cats = ['food','transport','utilities','entertainment','shopping','health','education','other'];
  const catLabels = { food:'🍕 Food & Dining', transport:'🚗 Transport', utilities:'🔌 Utilities', entertainment:'🎬 Entertainment', shopping:'🛍️ Shopping', health:'🏥 Health', education:'📚 Education', other:'📦 Other' };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div className="modal-title">{editData ? 'Edit Budget' : 'Create Budget'}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.cat} onChange={e => set('cat', e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Monthly Limit (₹)</label>
        <input type="number" className="form-input" placeholder="5000" value={form.limit} onChange={e => set('limit', e.target.value)} />
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={loading || !form.limit}>
          {loading ? 'Saving…' : 'Save Budget'}
        </button>
      </div>
    </Modal>
  );
}

/* ── Goal Modal ── */
export function GoalModal({ open, onClose }) {
  const { addGoal } = useApp();
  const [form, setForm] = useState({ name:'', icon:'🎯', target:'', saved:'0', targetDate:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm({ name:'', icon:'🎯', target:'', saved:'0', targetDate:'' });
  }, [open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.target) return;
    setLoading(true);
    try {
      await addGoal({ ...form, target: parseFloat(form.target), saved: parseFloat(form.saved) || 0 });
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div className="modal-title">Add Savings Goal</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="form-group">
        <label className="form-label">Goal Name</label>
        <input type="text" className="form-input" placeholder="Emergency Fund" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Icon</label>
          <input type="text" className="form-input" placeholder="🎯" maxLength={2} value={form.icon} onChange={e => set('icon', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Target Date</label>
          <input type="date" className="form-input" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Target Amount (₹)</label>
          <input type="number" className="form-input" placeholder="500000" value={form.target} onChange={e => set('target', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Saved So Far (₹)</label>
          <input type="number" className="form-input" placeholder="0" value={form.saved} onChange={e => set('saved', e.target.value)} />
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={loading || !form.name || !form.target}>
          {loading ? 'Saving…' : 'Save Goal'}
        </button>
      </div>
    </Modal>
  );
}
