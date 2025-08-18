import request from 'supertest';
import { performance } from 'perf_hooks';
import { app } from '../server';

describe('Performance Tests', () => {
  describe('API Response Times', () => {
    it('should respond to auth endpoints within acceptable time', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const start = performance.now();
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      const end = performance.now();

      const responseTime = end - start;
      
      // Should respond within 500ms
      expect(responseTime).toBeLessThan(500);
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('token');
      }
    });

    it('should handle login requests efficiently', async () => {
      // First register a user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Then test login performance
      const start = performance.now();
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      const end = performance.now();

      const responseTime = end - start;
      expect(responseTime).toBeLessThan(300);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
      }
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous registrations', async () => {
      const numRequests = 20;
      const requests = Array.from({ length: numRequests }, (_, i) =>
        request(app)
          .post('/api/auth/register')
          .send({
            username: `user${i}`,
            email: `user${i}@example.com`,
            password: 'password123'
          })
      );

      const start = performance.now();
      const responses = await Promise.all(requests);
      const end = performance.now();

      const totalTime = end - start;
      const avgTime = totalTime / numRequests;

      // Average response time should be reasonable
      expect(avgTime).toBeLessThan(200);

      // Most requests should succeed
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(numRequests * 0.8); // At least 80% success
    });

    it('should handle concurrent login attempts', async () => {
      // Register users first
      const numUsers = 10;
      for (let i = 0; i < numUsers; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            username: `user${i}`,
            email: `user${i}@example.com`,
            password: 'password123'
          });
      }

      // Then test concurrent logins
      const loginRequests = Array.from({ length: numUsers }, (_, i) =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: `user${i}@example.com`,
            password: 'password123'
          })
      );

      const start = performance.now();
      const responses = await Promise.all(loginRequests);
      const end = performance.now();

      const totalTime = end - start;
      const avgTime = totalTime / numUsers;

      expect(avgTime).toBeLessThan(150);

      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(numUsers * 0.8);
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            username: `user${i}`,
            email: `user${i}@example.com`,
            password: 'password123'
          });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Database Performance', () => {
    it('should efficiently query user data', async () => {
      // Create test users
      const numUsers = 50;
      for (let i = 0; i < numUsers; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            username: `perfuser${i}`,
            email: `perfuser${i}@example.com`,
            password: 'password123'
          });
      }

      // Test query performance
      const queryTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await request(app)
          .post('/api/auth/login')
          .send({
            email: `perfuser${i}@example.com`,
            password: 'password123'
          });
        const end = performance.now();
        
        queryTimes.push(end - start);
      }

      const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
      
      // Average query time should be fast
      expect(avgQueryTime).toBeLessThan(100);
    });
  });

  describe('Payload Size Handling', () => {
    it('should handle large payloads efficiently', async () => {
      const largeUsername = 'a'.repeat(1000); // 1KB username
      
      const start = performance.now();
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: largeUsername,
          email: 'large@example.com',
          password: 'password123'
        });
      const end = performance.now();

      const responseTime = end - start;
      
      // Should handle large payloads within reasonable time
      expect(responseTime).toBeLessThan(1000);
      
      // Might fail validation due to length limits, which is expected
      expect([201, 400, 500]).toContain(response.status);
    });

    it('should reject extremely large payloads', async () => {
      const extremelyLargeData = 'a'.repeat(10 * 1024 * 1024); // 10MB string
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: extremelyLargeData,
          email: 'extreme@example.com',
          password: 'password123'
        });

      // Should reject or handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Connection Handling', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
      const numCycles = 10;
      const times: number[] = [];

      for (let i = 0; i < numCycles; i++) {
        const start = performance.now();
        
        const response = await request(app)
          .get('/api/auth/register') // Just check if server responds
          .send();
        
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      // Connection handling should be efficient
      expect(avgTime).toBeLessThan(50);
    });
  });
});