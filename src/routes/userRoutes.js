/**
 * User Routes
 * Defines all endpoints for user management and authentication
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validate('register'), userController.register);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate('login'), userController.login);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Authenticated
 */
router.get('/', authenticate, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Authenticated
 */
router.get('/:id', authenticate, userController.getUserById);

module.exports = router;
