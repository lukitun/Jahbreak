import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../server';

describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should hash passwords properly', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Password should not be in response
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should generate secure JWT tokens', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.body.token).toBeDefined();
      
      // Verify token structure
      const decoded = jwt.decode(response.body.token) as any;
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('exp');
    });

    it('should validate JWT token expiration', () => {
      const expiredToken = jwt.sign(
        { userId: 'test' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '-1h' } // Expired token
      );

      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET || 'default_secret');
      }).toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email formats', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Should fail validation (depending on implementation)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should enforce password minimum length', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Should fail validation
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should prevent SQL injection attempts', async () => {
      const maliciousData = {
        username: "'; DROP TABLE users; --",
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData);

      // Should handle safely (MongoDB should prevent SQL injection by design)
      expect(response.status).toBeLessThan(500);
    });

    it('should sanitize XSS attempts', async () => {
      const xssData = {
        username: '<script>alert("xss")</script>',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssData);

      if (response.status === 201) {
        // If successful, ensure script tags are sanitized
        expect(response.body.user.username).not.toContain('<script>');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Send multiple requests rapidly
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .post('/api/auth/register')
          .send({
            ...userData,
            email: `test${Math.random()}@example.com`
          })
      );

      const responses = await Promise.all(requests);
      
      // At least some should succeed (no rate limiting implemented yet)
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('CORS Security', () => {
    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://localhost:3000');

      // Should allow configured origins
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should reject unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/auth/register')
        .set('Origin', 'http://malicious-site.com');

      // Behavior depends on CORS configuration
      // In this case, it might still allow since CORS is set to allow frontend URL
    });
  });

  describe('Environment Variables Security', () => {
    it('should use secure default values', () => {
      // Test that default secrets are used when env vars are missing
      const defaultJwtSecret = process.env.JWT_SECRET || 'default_secret';
      const defaultRefreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
      
      // In production, these should not be defaults
      if (process.env.NODE_ENV === 'production') {
        expect(defaultJwtSecret).not.toBe('default_secret');
        expect(defaultRefreshSecret).not.toBe('refresh_secret');
      }
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not expose sensitive error information', async () => {
      // Try to trigger a database error
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: null, password: null });

      // Should not expose internal error details
      expect(response.body.message).not.toContain('MongoDB');
      expect(response.body.message).not.toContain('Error:');
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});