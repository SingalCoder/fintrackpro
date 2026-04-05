const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json(budgets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { cat, limit } = req.body;
    if (!cat || !limit) return res.status(400).json({ message: 'Category and limit are required' });
    const existing = await Budget.findOne({ user: req.user._id, cat });
    if (existing) return res.status(400).json({ message: 'Budget for this category already exists' });
    const budget = await Budget.create({ user: req.user._id, cat, limit });
    res.status(201).json(budget);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    await budget.deleteOne();
    res.json({ message: 'Budget deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
