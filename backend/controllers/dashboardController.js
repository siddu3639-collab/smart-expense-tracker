const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const userId = req.user._id;

    const [
      thisMonthExpenses,
      thisMonthIncome,
      lastMonthExpenses,
      categoryBreakdown,
      recentTransactions,
      goalStats,
      budgetCount,
    ] = await Promise.all([
      // This month totals
      Expense.aggregate([
        { $match: { userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { userId, type: 'income', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      // Last month expenses (for trend)
      Expense.aggregate([
        { $match: { userId, type: 'expense', date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Category breakdown this month
      Expense.aggregate([
        { $match: { userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 6 },
      ]),
      // Recent transactions
      Expense.find({ userId }).sort({ date: -1 }).limit(5),
      // Goal stats
      Goal.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalGoals: { $sum: 1 },
            completedGoals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalTarget: { $sum: '$targetAmount' },
            totalSaved: { $sum: '$savedAmount' },
          },
        },
      ]),
      Budget.countDocuments({ userId, month: now.getMonth() + 1, year: now.getFullYear() }),
    ]);

    const totalExpenses = thisMonthExpenses[0]?.total || 0;
    const totalIncome = thisMonthIncome[0]?.total || 0;
    const lastMonthTotal = lastMonthExpenses[0]?.total || 0;
    const expenseTrend = lastMonthTotal > 0
      ? Math.round(((totalExpenses - lastMonthTotal) / lastMonthTotal) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalExpenses,
          totalIncome,
          netSavings: totalIncome - totalExpenses,
          expenseTrend,
          transactionCount: (thisMonthExpenses[0]?.count || 0) + (thisMonthIncome[0]?.count || 0),
        },
        categoryBreakdown,
        recentTransactions,
        goals: goalStats[0] || { totalGoals: 0, completedGoals: 0, totalTarget: 0, totalSaved: 0 },
        activeBudgets: budgetCount,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly trend (last 6 months)
// @route   GET /api/dashboard/trend
// @access  Private
const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const data = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format into chart-friendly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      const expenseEntry = data.find(d => d._id.month === month && d._id.year === year && d._id.type === 'expense');
      const incomeEntry = data.find(d => d._id.month === month && d._id.year === year && d._id.type === 'income');

      trend.push({
        label: `${monthNames[month - 1]} ${year}`,
        month,
        year,
        expenses: expenseEntry?.total || 0,
        income: incomeEntry?.total || 0,
      });
    }

    res.json({ success: true, data: { trend } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary, getMonthlyTrend };
