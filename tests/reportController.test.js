/**
 * Report Controller Tests
 * Tests for report generation endpoints
 */

const request = require('supertest');
const app = require('../src/server');
const { pool } = require('../src/config/database');

describe('Report Controller Tests', () => {
  let developerToken;

  beforeAll(async () => {
    // Login as developer
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'john@bugtracker.com',
        password: 'password123'
      });

    developerToken = loginRes.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/reports/bugs-by-priority', () => {
    it('should get bugs grouped by priority', async () => {
      const res = await request(app)
        .get('/api/reports/bugs-by-priority')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('priority');
        expect(res.body[0]).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/reports/bugs-per-day', () => {
    it('should get bugs created per day', async () => {
      const res = await request(app)
        .get('/api/reports/bugs-per-day?days=7')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/reports/developer-performance', () => {
    it('should get developer performance metrics', async () => {
      const res = await request(app)
        .get('/api/reports/developer-performance')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('total_assigned');
        expect(res.body[0]).toHaveProperty('resolved_count');
      }
    });
  });

  describe('GET /api/reports/sla-violations', () => {
    it('should get SLA violations', async () => {
      const res = await request(app)
        .get('/api/reports/sla-violations')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/reports/bug-status-summary', () => {
    it('should get bug status summary', async () => {
      const res = await request(app)
        .get('/api/reports/bug-status-summary')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('status');
        expect(res.body[0]).toHaveProperty('count');
      }
    });
  });
});
