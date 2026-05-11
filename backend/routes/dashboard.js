const express = require('express');
const router = express.Router();
const { getDashboardSummary, getMonthlyTrend } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/trend', getMonthlyTrend);

module.exports = router;
