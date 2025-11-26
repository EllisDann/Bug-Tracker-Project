/**
 * Bug Controller
 * Handles all bug-related business logic
 */

const { pool } = require('../config/database');
const { sendBugAssignmentEmail, sendBugStatusUpdateEmail } = require('../config/email');

/**
 * Get all bugs with filters and pagination
 */
async function getAllBugs(req, res) {
  try {
    const { status, priority, assigned_to, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
             u1.name as reporter_name, 
             u2.name as assigned_to_name
      FROM bugs b
      LEFT JOIN users u1 ON b.reporter_id = u1.id
      LEFT JOIN users u2 ON b.assigned_to = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND b.priority = ?';
      params.push(priority);
    }
    if (assigned_to) {
      query += ' AND b.assigned_to = ?';
      params.push(assigned_to);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [bugs] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM bugs WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }
    if (assigned_to) {
      countQuery += ' AND assigned_to = ?';
      countParams.push(assigned_to);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      bugs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single bug by ID
 */
async function getBugById(req, res) {
  try {
    const { id } = req.params;

    const [bugs] = await pool.query(`
      SELECT b.*, 
             u1.name as reporter_name, u1.email as reporter_email,
             u2.name as assigned_to_name, u2.email as assigned_to_email
      FROM bugs b
      LEFT JOIN users u1 ON b.reporter_id = u1.id
      LEFT JOIN users u2 ON b.assigned_to = u2.id
      WHERE b.id = ?
    `, [id]);

    if (bugs.length === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    // Get comments
    const [comments] = await pool.query(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.bug_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    res.json({ ...bugs[0], comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create new bug
 */
async function createBug(req, res) {
  try {
    const { title, description, priority, severity } = req.body;
    const reporter_id = req.user.id; // From auth middleware

    const [result] = await pool.query(`
      INSERT INTO bugs (title, description, priority, severity, reporter_id)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, priority || 'medium', severity || 'major', reporter_id]);

    const [newBug] = await pool.query('SELECT * FROM bugs WHERE id = ?', [result.insertId]);

    res.status(201).json(newBug[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update bug
 */
async function updateBug(req, res) {
  try {
    const { id } = req.params;
    const { title, description, priority, severity, status, assigned_to } = req.body;
    const user_id = req.user.id;

    // Get current bug state
    const [currentBug] = await pool.query('SELECT * FROM bugs WHERE id = ?', [id]);
    if (currentBug.length === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (severity !== undefined) {
      updates.push('severity = ?');
      params.push(severity);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'resolved') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);
    await pool.query(`UPDATE bugs SET ${updates.join(', ')} WHERE id = ?`, params);

    // Log changes in history
    for (const field of Object.keys(req.body)) {
      if (currentBug[0][field] !== req.body[field]) {
        await pool.query(`
          INSERT INTO bug_history (bug_id, user_id, field_changed, old_value, new_value)
          VALUES (?, ?, ?, ?, ?)
        `, [id, user_id, field, String(currentBug[0][field] || ''), String(req.body[field] || '')]);
      }
    }

    // Send email notifications
    const [updatedBug] = await pool.query('SELECT * FROM bugs WHERE id = ?', [id]);
    
    if (assigned_to && assigned_to !== currentBug[0].assigned_to) {
      const [developer] = await pool.query('SELECT * FROM users WHERE id = ?', [assigned_to]);
      if (developer.length > 0) {
        await sendBugAssignmentEmail(updatedBug[0], developer[0]);
      }
    }

    if (status && status !== currentBug[0].status) {
      const [reporter] = await pool.query('SELECT * FROM users WHERE id = ?', [currentBug[0].reporter_id]);
      if (reporter.length > 0) {
        await sendBugStatusUpdateEmail(updatedBug[0], reporter[0]);
      }
    }

    res.json(updatedBug[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete bug
 */
async function deleteBug(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM bugs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add comment to bug
 */
async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    // Check if bug exists
    const [bug] = await pool.query('SELECT * FROM bugs WHERE id = ?', [id]);
    if (bug.length === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    const [result] = await pool.query(`
      INSERT INTO comments (bug_id, user_id, comment)
      VALUES (?, ?, ?)
    `, [id, user_id, comment]);

    const [newComment] = await pool.query(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(newComment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  addComment
};
