const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const assets = await Portfolio.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { type, symbol, name, qty, buyPrice, date, coinId } = req.body;
    if (!type || !symbol || !qty || !buyPrice || !date)
      return res.status(400).json({ message: 'Please fill all required fields' });
    const asset = await Portfolio.create({ user: req.user._id, type, symbol, name, qty, buyPrice, date, coinId });
    res.status(201).json(asset);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const asset = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    const updated = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const asset = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    await asset.deleteOne();
    res.json({ message: 'Asset removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
