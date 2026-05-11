const express = require('express');
const router = express.Router();
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { budgetValidator, objectIdValidator } = require('../middleware/validators');

router.use(protect);

router.route('/').get(getBudgets).post(budgetValidator, createBudget);
router.route('/:id')
  .put(objectIdValidator(), updateBudget)
  .delete(objectIdValidator(), deleteBudget);

module.exports = router;
