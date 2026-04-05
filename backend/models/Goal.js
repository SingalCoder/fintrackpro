const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name:       { type: String, required: true, trim: true },
  icon:       { type: String, default: '🎯' },
  target:     { type: Number, required: true },
  saved:      { type: Number, default: 0 },
  targetDate: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
