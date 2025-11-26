/**
 * Bug Routes
 * Defines all endpoints for bug management
 */

const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bugController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/bugs
 * @desc    Get all bugs with optional filters
 * @access  All authenticated users
 */
router.get('/', bugController.getAllBugs);

/**
 * @route   GET /api/bugs/:id
 * @desc    Get single bug by ID
 * @access  All authenticated users
 */
router.get('/:id', bugController.getBugById);

/**
 * @route   POST /api/bugs
 * @desc    Create new bug
 * @access  All authenticated users
 */
router.post('/', validate('createBug'), bugController.createBug);

/**
 * @route   PUT /api/bugs/:id
 * @desc    Update bug
 * @access  Admin and Developer
 */
router.put('/:id', authorize('admin', 'developer'), validate('updateBug'), bugController.updateBug);

/**
 * @route   DELETE /api/bugs/:id
 * @desc    Delete bug
 * @access  Admin only
 */
router.delete('/:id', authorize('admin'), bugController.deleteBug);

/**
 * @route   POST /api/bugs/:id/comments
 * @desc    Add comment to bug
 * @access  All authenticated users
 */
router.post('/:id/comments', validate('addComment'), bugController.addComment);

module.exports = router;
