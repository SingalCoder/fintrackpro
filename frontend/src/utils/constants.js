export const CRYPTO_IDS = {
  BTC:'bitcoin', ETH:'ethereum', BNB:'binancecoin', SOL:'solana',
  ADA:'cardano', XRP:'ripple', DOGE:'dogecoin', MATIC:'matic-network',
  DOT:'polkadot', AVAX:'avalanche-2', LINK:'chainlink',
};
export const CURRENCY_SYMBOLS = { INR:'₹', USD:'$', EUR:'€', GBP:'£', AED:'د.إ', JPY:'¥', SGD:'S$' };
export const CAT_ICONS = {
  food:'🍕', transport:'🚗', utilities:'🔌', entertainment:'🎬',
  shopping:'🛍️', salary:'💼', freelance:'💻', investment:'📈',
  health:'🏥', education:'📚', other:'📦',
};
export const CAT_COLORS = {
  food:'#f43f5e', transport:'#3b82f6', utilities:'#8b5cf6',
  entertainment:'#ec4899', shopping:'#f59e0b', salary:'#10b981',
  freelance:'06b6d4', investment:'#6366f1', health:'#14b8a6',
  education:'#f97316', other:'#94a3b8',
};
export const STOCK_BASE = {
  RELIANCE:{price:2950}, TCS:{price:4100}, INFY:{price:1820}, HDFC:{price:1680},
  WIPRO:{price:570}, NIFTY50:{price:175}, AAPL:{price:195*83}, GOOGL:{price:175*83},
};

export function fmtMoney(inrAmt, currency = 'INR', rates = {}, dec = 0) {
  const s = CURRENCY_SYMBOLS[currency] || currency + ' ';
  const inrRate = rates['INR'] || 83.5;
  if (currency === 'INR') {
    if (Math.abs(inrAmt) >= 1e7) return s + (inrAmt/1e7).toFixed(2) + 'Cr';
    if (Math.abs(inrAmt) >= 1e5) return s + (inrAmt/1e5).toFixed(2) + 'L';
    return s + inrAmt.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  const usd = inrAmt / inrRate;
  const cRate = rates[currency] || 1;
  const val = usd * cRate;
  if (Math.abs(val) >= 1e6) return s + (val/1e6).toFixed(2) + 'M';
  if (Math.abs(val) >= 1e3) return s + (val/1e3).toFixed(1) + 'K';
  return s + val.toFixed(val < 1 ? 4 : 2);
}

export function getAssetCurrentINR(asset, cryptoPrices = {}, rates = {}) {
  if (asset.type === 'crypto' && asset.coinId) {
    const p = cryptoPrices[asset.coinId];
    if (p?.inr) return p.inr;
    if (p?.usd) return p.usd * (rates['INR'] || 83.5);
  }
  if (asset.type === 'stock' || asset.type === 'mutual_fund' || asset.type === 'etf') {
    return STOCK_BASE[asset.symbol]?.price || asset.buyPrice;
  }
  return asset.buyPrice;
}

export function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export const DEMO_TRANSACTIONS = () => {
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();
  const lm = m === 0 ? 11 : m - 1;
  const ly = m === 0 ? y - 1 : y;
  const pad = n => String(n+1).padStart(2,'0');
  return [
    {type:'income', desc:'Monthly Salary',      cat:'salary',        amt:85000, date:`${y}-${pad(m)}-01`,   notes:''},
    {type:'expense',desc:'Grocery Shopping',    cat:'food',          amt:3200,  date:`${y}-${pad(m)}-03`,   notes:'Bigbasket order'},
    {type:'expense',desc:'Netflix & Spotify',   cat:'entertainment', amt:799,   date:`${y}-${pad(m)}-05`,   notes:''},
    {type:'expense',desc:'Electricity Bill',    cat:'utilities',     amt:1800,  date:`${y}-${pad(m)}-06`,   notes:''},
    {type:'investment',desc:'SIP — Axis Bluechip',cat:'investment',  amt:5000,  date:`${y}-${pad(m)}-07`,   notes:'Monthly SIP'},
    {type:'expense',desc:'Uber & Ola Rides',    cat:'transport',     amt:1200,  date:`${y}-${pad(m)}-10`,   notes:''},
    {type:'income', desc:'Freelance Project',   cat:'freelance',     amt:25000, date:`${y}-${pad(m)}-12`,   notes:'UI Design'},
    {type:'expense',desc:'Amazon Shopping',     cat:'shopping',      amt:4500,  date:`${y}-${pad(m)}-14`,   notes:''},
    {type:'expense',desc:'Restaurant Dinner',   cat:'food',          amt:2100,  date:`${y}-${pad(m)}-16`,   notes:'Anniversary'},
    {type:'expense',desc:'Gym Membership',      cat:'health',        amt:1499,  date:`${y}-${pad(m)}-18`,   notes:''},
    {type:'income', desc:'Monthly Salary',      cat:'salary',        amt:85000, date:`${ly}-${pad(lm)}-01`, notes:''},
    {type:'expense',desc:'Grocery Shopping',    cat:'food',          amt:2800,  date:`${ly}-${pad(lm)}-04`, notes:''},
    {type:'expense',desc:'Online Course',       cat:'education',     amt:3999,  date:`${ly}-${pad(lm)}-10`, notes:'Udemy'},
    {type:'expense',desc:'Phone Bill',          cat:'utilities',     amt:699,   date:`${ly}-${pad(lm)}-12`, notes:''},
    {type:'expense',desc:'Zomato Orders',       cat:'food',          amt:1800,  date:`${ly}-${pad(lm)}-18`, notes:''},
  ];
};
export const DEMO_PORTFOLIO = [
  {type:'crypto',      symbol:'BTC',     name:'Bitcoin',              qty:0.05, buyPrice:6900000, date:'2024-10-01', coinId:'bitcoin'},
  {type:'crypto',      symbol:'ETH',     name:'Ethereum',             qty:0.5,  buyPrice:270000,  date:'2024-11-15', coinId:'ethereum'},
  {type:'crypto',      symbol:'SOL',     name:'Solana',               qty:5,    buyPrice:14500,   date:'2024-12-01', coinId:'solana'},
  {type:'stock',       symbol:'RELIANCE',name:'Reliance Industries',  qty:10,   buyPrice:2800,    date:'2024-08-01', coinId:null},
  {type:'stock',       symbol:'TCS',     name:'TCS',                  qty:5,    buyPrice:3900,    date:'2024-09-15', coinId:null},
  {type:'mutual_fund', symbol:'NIFTY50', name:'Nifty 50 Index Fund',  qty:500,  buyPrice:150,     date:'2024-01-01', coinId:null},
];
export const DEMO_GOALS = [
  {name:'Emergency Fund', icon:'🛡️', target:300000, saved:125000, targetDate:'2025-12-31'},
  {name:'New MacBook',    icon:'💻', target:150000, saved:60000,  targetDate:'2025-09-01'},
  {name:'Europe Trip',    icon:'✈️', target:250000, saved:40000,  targetDate:'2026-06-01'},
];
export const DEMO_BUDGETS = [
  {cat:'food',          limit:8000},
  {cat:'transport',     limit:3000},
  {cat:'entertainment', limit:2000},
  {cat:'shopping',      limit:5000},
  {cat:'utilities',     limit:3000},
];
