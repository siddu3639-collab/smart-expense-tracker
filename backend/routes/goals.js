const express = require('express');
const router = express.Router();
const { getGoals, getGoal, createGoal, updateGoal, deleteGoal, contributeToGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { goalValidator, objectIdValidator } = require('../middleware/validators');

router.use(protect);

router.route('/').get(getGoals).post(goalValidator, createGoal);
router.route('/:id')
  .get(objectIdValidator(), getGoal)
  .put(objectIdValidator(), updateGoal)
  .delete(objectIdValidator(), deleteGoal);
router.patch('/:id/contribute', objectIdValidator(), contributeToGoal);

module.exports = router;
