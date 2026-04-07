import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import API from '../utils/api';
import { DEMO_TRANSACTIONS, DEMO_PORTFOLIO, DEMO_GOALS, DEMO_BUDGETS } from '../utils/constants';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(localStorage.getItem('ftpro_token'));
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio]     = useState([]);
  const [budgets, setBudgets]         = useState([]);
  const [goals, setGoals]             = useState([]);
  const [rates, setRates]             = useState({});
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [currency, setCurrencyState]  = useState('INR');
  const [theme, setTheme]             = useState(localStorage.getItem('ftpro_theme') || 'dark');
  const [loading, setLoading]         = useState(!!localStorage.getItem('ftpro_token'));
  const [toasts, setToasts]           = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [liveStatus, setLiveStatus]   = useState('Connecting…');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ftpro_theme', theme);
  }, [theme]);

  // Toast helper
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // Fetch all user data from backend
  const fetchAllData = useCallback(async () => {
    try {
      const [txRes, portRes, budRes, goalRes] = await Promise.all([
        API.get('/transactions'),
        API.get('/portfolio'),
        API.get('/budgets'),
        API.get('/goals'),
      ]);
      if (!isMounted.current) return;
      setTransactions(txRes.data);
      setPortfolio(portRes.data);
      setBudgets(budRes.data);
      setGoals(goalRes.data);
    } catch (e) { console.error('fetchAllData error', e); }
  }, []);

  // Seed demo data for new users
  const seedDemoData = useCallback(async () => {
    try {
      // Run sequentially to avoid rate-limiting or MongoDB connection timeouts on Render free tier
      for (const t of DEMO_TRANSACTIONS()) { await API.post('/transactions', t).catch(() => {}); }
      for (const p of DEMO_PORTFOLIO) { await API.post('/portfolio', p).catch(() => {}); }
      for (const g of DEMO_GOALS) { await API.post('/goals', g).catch(() => {}); }
      for (const b of DEMO_BUDGETS) { await API.post('/budgets', b).catch(() => {}); }
    } catch (e) {
      console.error('seedDemoData error', e);
    } finally {
      await fetchAllData();
    }
  }, [fetchAllData]);

  // Login
  const login = useCallback(async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: t, ...userData } = res.data;
    localStorage.setItem('ftpro_token', t);
    setToken(t);
    await fetchAllData(); // Fetch data first
    setUser(userData);    // THEN update UI
    setCurrencyState(userData.currency || 'INR');
  }, [fetchAllData]);

  // Register
  const register = useCallback(async (name, email, password, curr) => {
    const res = await API.post('/auth/register', { name, email, password, currency: curr });
    const { token: t, ...userData } = res.data;
    localStorage.setItem('ftpro_token', t);
    setToken(t);
    await seedDemoData(); // Wait for seeding + fetching
    setUser(userData);    // THEN let them into the dashboard
    setCurrencyState(curr || 'INR');
    toast(`Welcome to FinTrack Pro, ${name.split(' ')[0]}! 🎉`, 'success');
  }, [seedDemoData, toast]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('ftpro_token');
    setToken(null);
    setUser(null);
    setTransactions([]); setPortfolio([]); setBudgets([]); setGoals([]);
    setCurrentPage('dashboard');
  }, []);

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const timeout = setTimeout(() => {
      if (isMounted.current) { setLoading(false); localStorage.removeItem('ftpro_token'); setToken(null); }
    }, 8000);
    API.get('/auth/me')
      .then(res => { setUser(res.data); setCurrencyState(res.data.currency || 'INR'); return fetchAllData(); })
      .catch(() => { localStorage.removeItem('ftpro_token'); setToken(null); })
      .finally(() => { clearTimeout(timeout); if (isMounted.current) setLoading(false); });
  }, []); // eslint-disable-line

  // Exchange rates — via backend to avoid CORS
  useEffect(() => {
    API.get('/prices/rates')
      .then(r => { if (isMounted.current) setRates({ ...r.data.rates, USD: 1 }); })
      .catch(() => setRates({ USD:1, INR:83.5, EUR:0.92, GBP:0.79, AED:3.67, JPY:149.5, SGD:1.34 }));
  }, []);

  // Crypto prices — via backend to avoid CORS
  const fetchCryptoPrices = useCallback(async () => {
    const baseIds = ['bitcoin','ethereum','binancecoin','solana','cardano','ripple','dogecoin'];
    const portIds = portfolio.filter(p => p.coinId).map(p => p.coinId);
    const ids = [...new Set([...baseIds, ...portIds])];
    try {
      const r = await API.get(`/prices/crypto?ids=${ids.join(',')}`);
      if (isMounted.current) { setCryptoPrices(r.data); setLiveStatus('Updated just now ✓'); }
    } catch { if (isMounted.current) setLiveStatus('Using cached prices'); }
  }, [portfolio]);

  useEffect(() => {
    fetchCryptoPrices();
    const iv = setInterval(fetchCryptoPrices, 10000);
    return () => clearInterval(iv);
  }, [fetchCryptoPrices]);

  // Currency change
  const setCurrency = useCallback(async (c) => {
    setCurrencyState(c);
    try { await API.put('/auth/currency', { currency: c }); } catch {}
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  // CRUD helpers
  const addTransaction = useCallback(async (data) => {
    const res = await API.post('/transactions', data);
    setTransactions(t => [res.data, ...t]);
    toast('Transaction added ✓', 'success');
  }, [toast]);

  const updateTransaction = useCallback(async (id, data) => {
    const res = await API.put(`/transactions/${id}`, data);
    setTransactions(t => t.map(x => x._id === id ? res.data : x));
    toast('Transaction updated ✓', 'success');
  }, [toast]);

  const deleteTransaction = useCallback(async (id) => {
    await API.delete(`/transactions/${id}`);
    setTransactions(t => t.filter(x => x._id !== id));
    toast('Transaction deleted', 'info');
  }, [toast]);

  const addAsset = useCallback(async (data) => {
    const res = await API.post('/portfolio', data);
    setPortfolio(p => [res.data, ...p]);
    toast('Asset added ✓', 'success');
  }, [toast]);

  const updateAsset = useCallback(async (id, data) => {
    const res = await API.put(`/portfolio/${id}`, data);
    setPortfolio(p => p.map(x => x._id === id ? res.data : x));
    toast('Asset updated ✓', 'success');
  }, [toast]);

  const deleteAsset = useCallback(async (id) => {
    await API.delete(`/portfolio/${id}`);
    setPortfolio(p => p.filter(x => x._id !== id));
    toast('Asset removed', 'info');
  }, [toast]);

  const addBudget = useCallback(async (data) => {
    const res = await API.post('/budgets', data);
    setBudgets(b => [...b, res.data]);
    toast('Budget created ✓', 'success');
  }, [toast]);

  const updateBudget = useCallback(async (id, data) => {
    const res = await API.put(`/budgets/${id}`, data);
    setBudgets(b => b.map(x => x._id === id ? res.data : x));
    toast('Budget updated ✓', 'success');
  }, [toast]);

  const deleteBudget = useCallback(async (id) => {
    await API.delete(`/budgets/${id}`);
    setBudgets(b => b.filter(x => x._id !== id));
    toast('Budget removed', 'info');
  }, [toast]);

  const addGoal = useCallback(async (data) => {
    const res = await API.post('/goals', data);
    setGoals(g => [...g, res.data]);
    toast('Goal added ✓', 'success');
  }, [toast]);

  const deleteGoal = useCallback(async (id) => {
    await API.delete(`/goals/${id}`);
    setGoals(g => g.filter(x => x._id !== id));
    toast('Goal removed', 'info');
  }, [toast]);

  return (
    <AppContext.Provider value={{
      user, token, loading,
      transactions, portfolio, budgets, goals,
      rates, cryptoPrices, currency, theme, liveStatus,
      currentPage, setCurrentPage,
      toasts,
      login, register, logout,
      setCurrency, toggleTheme, toast,
      addTransaction, updateTransaction, deleteTransaction,
      addAsset, updateAsset, deleteAsset,
      addBudget, updateBudget, deleteBudget,
      addGoal, deleteGoal,
      fetchCryptoPrices,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);