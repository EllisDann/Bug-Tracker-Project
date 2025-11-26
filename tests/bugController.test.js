/**
 * Bug Controller Tests
 * Tests for bug CRUD operations
 */

const request = require('supertest');
const app = require('../src/server');
const { pool } = require('../src/config/database');

describe('Bug Controller Tests', () => {
  let authToken;
  let adminToken;
  let userId;
  let bugId;

  beforeAll(async () => {
    // Register and login a test user
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'reporter'
      });

    userId = registerRes.body.id;

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginRes.body.token;

    // Login as admin
    const adminLoginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@bugtracker.com',
        password: 'password123'
      });

    adminToken = adminLoginRes.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = ?', ['test@example.com']);
    await pool.end();
  });

  describe('POST /api/bugs', () => {
    it('should create a new bug', async () => {
      const res = await request(app)
        .post('/api/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Bug',
          description: 'This is a test bug description that is long enough',
          priority: 'high',
          severity: 'major'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Bug');
      bugId = res.body.id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/bugs')
        .send({
          title: 'Test Bug',
          description: 'This is a test bug description'
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'AB', // Too short
          description: 'Short'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bugs', () => {
    it('should get all bugs', async () => {
      const res = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bugs');
      expect(Array.isArray(res.body.bugs)).toBe(true);
    });

    it('should filter bugs by status', async () => {
      const res = await request(app)
        .get('/api/bugs?status=open')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bugs');
    });
  });

  describe('GET /api/bugs/:id', () => {
    it('should get a single bug', async () => {
      const res = await request(app)
        .get(`/api/bugs/${bugId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(bugId);
    });

    it('should return 404 for non-existent bug', async () => {
      const res = await request(app)
        .get('/api/bugs/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/bugs/:id', () => {
    it('should update a bug', async () => {
      const res = await request(app)
        .put(`/api/bugs/${bugId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'in_progress'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('in_progress');
    });

    it('should fail without proper role', async () => {
      const res = await request(app)
        .put(`/api/bugs/${bugId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'resolved'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/bugs/:id/comments', () => {
    it('should add a comment to a bug', async () => {
      const res = await request(app)
        .post(`/api/bugs/${bugId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'This is a test comment'
        });

      expect(res.status).toBe(201);
      expect(res.body.comment).toBe('This is a test comment');
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    it('should delete a bug', async () => {
      const res = await request(app)
        .delete(`/api/bugs/${bugId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail without admin role', async () => {
      const res = await request(app)
        .delete(`/api/bugs/${bugId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });
  });
});
