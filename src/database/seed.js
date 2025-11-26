/**
 * Database Seed Script
 * Run with: npm run db:seed
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@bugtracker.com', ?, 'admin'),
      ('John Developer', 'john@bugtracker.com', ?, 'developer'),
      ('Jane Developer', 'jane@bugtracker.com', ?, 'developer'),
      ('Bob Reporter', 'bob@bugtracker.com', ?, 'reporter')
      ON DUPLICATE KEY UPDATE name=name
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword]);

    console.log('✓ Users seeded');

    // Create sample bugs
    await pool.query(`
      INSERT INTO bugs (title, description, priority, severity, status, reporter_id, assigned_to) VALUES
      ('Login page not loading', 'Users cannot access the login page on mobile devices', 'critical', 'critical', 'open', 4, 2),
      ('Search results pagination broken', 'Clicking page 2 returns no results', 'high', 'major', 'in_progress', 4, 2),
      ('Typo in footer text', 'Copyright year shows 2022 instead of 2024', 'low', 'minor', 'open', 4, NULL),
      ('API returning 500 error', 'GET /api/users endpoint crashes server', 'critical', 'critical', 'resolved', 4, 3),
      ('Slow dashboard loading', 'Dashboard takes 10+ seconds to load', 'medium', 'major', 'open', 4, 3)
      ON DUPLICATE KEY UPDATE title=title
    `);

    console.log('✓ Bugs seeded');

    // Create sample comments
    await pool.query(`
      INSERT INTO comments (bug_id, user_id, comment) VALUES
      (1, 2, 'I can reproduce this on iPhone 14. Investigating now.'),
      (2, 2, 'Fixed the SQL query. Testing on staging.'),
      (4, 3, 'Issue was with null pointer. Deployed fix.')
      ON DUPLICATE KEY UPDATE comment=comment
    `);

    console.log('✓ Comments seeded');

    console.log('✓ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
