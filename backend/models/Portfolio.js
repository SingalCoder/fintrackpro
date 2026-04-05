const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['crypto', 'stock', 'mf', 'gold'],
    required: true,
  },
  symbol: { type: String, required: true, uppercase: true, trim: true },
  name:   { type: String, required: true, trim: true },
  qty:    { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  date:   { type: String, required: true },
  coinId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
