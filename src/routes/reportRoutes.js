/**
 * Report Routes
 * Defines all endpoints for generating reports
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and admin/developer role
router.use(authenticate);
router.use(authorize('admin', 'developer'));

/**
 * @route   GET /api/reports/bugs-by-priority
 * @desc    Get bugs grouped by priority
 * @access  Admin, Developer
 */
router.get('/bugs-by-priority', reportController.getBugsByPriority);

/**
 * @route   GET /api/reports/bugs-per-day
 * @desc    Get bugs created per day (last N days)
 * @access  Admin, Developer
 */
router.get('/bugs-per-day', reportController.getBugsPerDay);

/**
 * @route   GET /api/reports/developer-performance
 * @desc    Get developer performance metrics
 * @access  Admin, Developer
 */
router.get('/developer-performance', reportController.getDeveloperPerformance);

/**
 * @route   GET /api/reports/sla-violations
 * @desc    Get bugs violating SLA thresholds
 * @access  Admin, Developer
 */
router.get('/sla-violations', reportController.getSLAViolations);

/**
 * @route   GET /api/reports/bug-status-summary
 * @desc    Get summary of bugs by status
 * @access  Admin, Developer
 */
router.get('/bug-status-summary', reportController.getBugStatusSummary);

module.exports = router;
