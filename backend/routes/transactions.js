const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(txns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { type, desc, amt, cat, date, notes } = req.body;
    if (!type || !desc || !amt || !cat || !date)
      return res.status(400).json({ message: 'Please fill all required fields' });
    const txn = await Transaction.create({ user: req.user._id, type, desc, amt, cat, date, notes });
    res.status(201).json(txn);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    await txn.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
