const FALLBACK_CRYPTO = {
  bitcoin:      { usd: 83500,  inr: 6971250,  usd_24h_change:  1.2 },
  ethereum:     { usd: 3250,   inr: 271375,   usd_24h_change:  0.8 },
  binancecoin:  { usd: 420,    inr: 35070,    usd_24h_change:  0.5 },
  solana:       { usd: 145,    inr: 12107,    usd_24h_change:  2.1 },
  cardano:      { usd: 0.45,   inr: 37.6,     usd_24h_change: -0.3 },
  ripple:       { usd: 0.52,   inr: 43.4,     usd_24h_change:  0.9 },
  dogecoin:     { usd: 0.12,   inr: 10.02,    usd_24h_change: -0.6 },
};

const express = require('express');
const https = require('https');
const router = express.Router();

const cache = {
  crypto: { data: null, lastFetched: 0 },
  rates:  { data: null, lastFetched: 0 },
};
const CRYPTO_TTL = 2 * 60 * 1000;  // 2 minutes
const RATES_TTL  = 60 * 60 * 1000; // 1 hour

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FinTrackPro/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// GET /api/prices/crypto — uses CoinCap API (no rate limits, no API key needed)
router.get('/crypto', async (req, res) => {
  const now = Date.now();
  if (cache.crypto.data && (now - cache.crypto.lastFetched) < CRYPTO_TTL) {
    return res.json(cache.crypto.data);
  }
  try {
    const data = await httpsGet('https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,binance-coin,solana,cardano,xrp,dogecoin&limit=10');
    if (!data.data) throw new Error('Bad response');

    // Convert CoinCap format to CoinGecko-compatible format
    const inrRate = 83.5;
    const result = {};
    const idMap = {
      'bitcoin': 'bitcoin', 'ethereum': 'ethereum', 'binance-coin': 'binancecoin',
      'solana': 'solana', 'cardano': 'cardano', 'xrp': 'ripple', 'dogecoin': 'dogecoin'
    };
    data.data.forEach(coin => {
      const key = idMap[coin.id] || coin.id;
      const usd = parseFloat(coin.priceUsd) || 0;
      result[key] = {
        usd: usd,
        inr: usd * inrRate,
        usd_24h_change: parseFloat(coin.changePercent24Hr) || 0,
      };
    });

    cache.crypto.data = result;
    cache.crypto.lastFetched = now;
    res.json(result);
  } catch (err) {
    console.error('Crypto fetch error:', err.message);
    res.json(cache.crypto.data || FALLBACK_CRYPTO);
  }
});

// GET /api/prices/rates
router.get('/rates', async (req, res) => {
  const now = Date.now();
  if (cache.rates.data && (now - cache.rates.lastFetched) < RATES_TTL) {
    return res.json(cache.rates.data);
  }
  try {
    const data = await httpsGet('https://api.exchangerate-api.com/v4/latest/USD');
    cache.rates.data = data;
    cache.rates.lastFetched = now;
    res.json(data);
  } catch (err) {
    res.json(cache.rates.data || { rates: { USD:1, INR:83.5, EUR:0.92, GBP:0.79, AED:3.67, JPY:149.5, SGD:1.34 } });
  }
});

module.exports = router;