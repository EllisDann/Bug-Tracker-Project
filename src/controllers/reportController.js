/**
 * Report Controller
 * Generates custom reports from MySQL data
 */

const { pool } = require('../config/database');

/**
 * Get bugs by priority report
 */
async function getBugsByPriority(req, res) {
  try {
    const [results] = await pool.query(`
      SELECT 
        priority,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
      FROM bugs
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get bugs created per day (last 30 days)
 */
async function getBugsPerDay(req, res) {
  try {
    const { days = 30 } = req.query;

    const [results] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count
      FROM bugs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get developer performance report
 */
async function getDeveloperPerformance(req, res) {
  try {
    const [results] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(b.id) as total_assigned,
        COUNT(CASE WHEN b.status = 'resolved' THEN 1 END) as resolved_count,
        COUNT(CASE WHEN b.status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN b.status = 'open' THEN 1 END) as open_count,
        AVG(
          CASE 
            WHEN b.resolved_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, b.created_at, b.resolved_at)
          END
        ) as avg_resolution_time_hours
      FROM users u
      LEFT JOIN bugs b ON u.id = b.assigned_to
      WHERE u.role = 'developer'
      GROUP BY u.id, u.name
      ORDER BY resolved_count DESC
    `);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get SLA violations (bugs open > 24 hours for critical priority)
 */
async function getSLAViolations(req, res) {
  try {
    const [results] = await pool.query(`
      SELECT 
        b.*,
        u1.name as reporter_name,
        u2.name as assigned_to_name,
        TIMESTAMPDIFF(HOUR, b.created_at, NOW()) as hours_open
      FROM bugs b
      LEFT JOIN users u1 ON b.reporter_id = u1.id
      LEFT JOIN users u2 ON b.assigned_to = u2.id
      WHERE b.status IN ('open', 'in_progress')
        AND (
          (b.priority = 'critical' AND TIMESTAMPDIFF(HOUR, b.created_at, NOW()) > 24)
          OR (b.priority = 'high' AND TIMESTAMPDIFF(HOUR, b.created_at, NOW()) > 48)
        )
      ORDER BY hours_open DESC
    `);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get bug status summary
 */
async function getBugStatusSummary(req, res) {
  try {
    const [results] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_count
      FROM bugs
      GROUP BY status
    `);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getBugsByPriority,
  getBugsPerDay,
  getDeveloperPerformance,
  getSLAViolations,
  getBugStatusSummary
};
