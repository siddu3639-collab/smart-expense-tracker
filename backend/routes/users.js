const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;
