const express = require('express');
const router = express.Router();
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getCategories } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { expenseValidator, objectIdValidator } = require('../middleware/validators');

router.use(protect);

router.get('/categories', getCategories);
router.route('/').get(getExpenses).post(expenseValidator, createExpense);
router.route('/:id')
  .get(objectIdValidator(), getExpense)
  .put(objectIdValidator(), expenseValidator, updateExpense)
  .delete(objectIdValidator(), deleteExpense);

module.exports = router;
