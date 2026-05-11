const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get budgets (with spending data)
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month: targetMonth,
      year: targetYear,
    });

    // Get spending per category for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const spending = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    spending.forEach(s => { spendingMap[s._id] = s.total; });

    const budgetsWithSpending = budgets.map(budget => {
      const spent = spendingMap[budget.category] || 0;
      const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
      return {
        ...budget.toObject(),
        spent,
        remaining: Math.max(budget.limit - spent, 0),
        percentage,
        isOverBudget: spent > budget.limit,
        isAlert: percentage >= budget.alertThreshold,
      };
    });

    res.json({
      success: true,
      data: { budgets: budgetsWithSpending, month: targetMonth, year: targetYear },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const budget = await Budget.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: 'Budget created.', data: { budget } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Budget for this category already exists for this month.',
      });
    }
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }
    res.json({ success: true, message: 'Budget updated.', data: { budget } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }
    res.json({ success: true, message: 'Budget deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
