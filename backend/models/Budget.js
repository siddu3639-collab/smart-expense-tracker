const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [1, 'Budget limit must be greater than 0'],
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alert at 80% usage
    min: 1,
    max: 100,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200,
  },
}, { timestamps: true });

// One budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
