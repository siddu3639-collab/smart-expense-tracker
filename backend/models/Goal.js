const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be greater than 0'],
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required'],
  },
  category: {
    type: String,
    enum: ['Emergency Fund', 'Travel', 'Education', 'Home', 'Vehicle', 'Retirement', 'Investment', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: '🎯',
  },
}, { timestamps: true });

// Virtual for progress percentage
goalSchema.virtual('progressPercent').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(Math.round((this.savedAmount / this.targetAmount) * 100), 100);
});

goalSchema.virtual('remainingAmount').get(function () {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
