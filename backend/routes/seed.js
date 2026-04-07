const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// POST /api/seed — Bulk insert demo data in one request
router.post('/', async (req, res) => {
  try {
    const { transactions, portfolio, goals, budgets } = req.body;
    const userId = req.user._id;

    const results = await Promise.all([
      transactions?.length
        ? Transaction.insertMany(transactions.map(t => ({ ...t, user: userId })))
        : [],
      portfolio?.length
        ? Portfolio.insertMany(portfolio.map(p => ({ ...p, user: userId })))
        : [],
      goals?.length
        ? Goal.insertMany(goals.map(g => ({ ...g, user: userId })))
        : [],
      budgets?.length
        ? Budget.insertMany(budgets.map(b => ({ ...b, user: userId })))
        : [],
    ]);

    res.status(201).json({
      transactions: results[0],
      portfolio: results[1],
      goals: results[2],
      budgets: results[3],
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
