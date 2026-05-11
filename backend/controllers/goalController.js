const Goal = require('../models/Goal');

const getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { goals } });
  } catch (error) {
    next(error);
  }
};

const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, data: { goal } });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: 'Goal created.', data: { goal } });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal updated.', data: { goal } });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to goal
// @route   PATCH /api/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    goal.savedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
    if (goal.savedAmount >= goal.targetAmount) goal.status = 'completed';
    await goal.save();

    res.json({ success: true, message: 'Contribution added.', data: { goal } });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGoals, getGoal, createGoal, updateGoal, deleteGoal, contributeToGoal };
