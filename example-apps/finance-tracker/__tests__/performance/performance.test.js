const request = require('supertest');
const { performance } = require('perf_hooks');
const app = require('../../backend/src/server');

describe('Performance Tests', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Create test user
    const userData = {
      email: 'performance@test.com',
      password: 'password123',
      firstName: 'Performance',
      lastName: 'Test'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    authToken = response.body.token;
    testUserId = response.body.user.id;
  });

  describe('API Response Times', () => {
    test('registration should complete within reasonable time', async () => {
      const start = performance.now();
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'speed@test.com',
          password: 'password123',
          firstName: 'Speed',
          lastName: 'Test'
        })
        .expect(201);

      const end = performance.now();
      const responseTime = end - start;

      // Registration should complete in under 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });

    test('login should be fast', async () => {
      const start = performance.now();
      
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'performance@test.com',
          password: 'password123'
        })
        .expect(200);

      const end = performance.now();
      const responseTime = end - start;

      // Login should complete in under 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    test('expense creation should be efficient', async () => {
      const start = performance.now();
      
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50.00,
          category: 'Food',
          description: 'Performance test expense'
        })
        .expect(201);

      const end = performance.now();
      const responseTime = end - start;

      // Expense creation should complete in under 500ms
      expect(responseTime).toBeLessThan(500);
    });

    test('expense retrieval should be fast', async () => {
      const start = performance.now();
      
      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const end = performance.now();
      const responseTime = end - start;

      // Expense retrieval should complete in under 300ms
      expect(responseTime).toBeLessThan(300);
    });

    test('budget summary calculation should be efficient', async () => {
      // Create a budget first
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Food',
          amount: 500.00,
          period: 'monthly',
          year: 2024,
          month: 1
        });

      const start = performance.now();
      
      await request(app)
        .get('/api/budgets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 })
        .expect(200);

      const end = performance.now();
      const responseTime = end - start;

      // Budget summary should complete in under 800ms (includes aggregation)
      expect(responseTime).toBeLessThan(800);
    });
  });

  describe('Load Testing Scenarios', () => {
    test('should handle multiple concurrent expense creations', async () => {
      const start = performance.now();
      
      // Create 20 expenses concurrently
      const promises = Array.from({ length: 20 }, (_, index) =>
        request(app)
          .post('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 10 + index,
            category: 'Food',
            description: `Concurrent expense ${index}`
          })
      );

      const responses = await Promise.all(promises);
      const end = performance.now();
      const totalTime = end - start;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // 20 concurrent requests should complete in under 5 seconds
      expect(totalTime).toBeLessThan(5000);

      console.log(`20 concurrent expense creations completed in ${totalTime.toFixed(2)}ms`);
    });

    test('should handle rapid sequential requests', async () => {
      const start = performance.now();
      
      // Create 10 expenses sequentially
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 20 + i,
            category: 'Transportation',
            description: `Sequential expense ${i}`
          })
          .expect(201);
      }

      const end = performance.now();
      const totalTime = end - start;

      // 10 sequential requests should complete in under 3 seconds
      expect(totalTime).toBeLessThan(3000);

      console.log(`10 sequential expense creations completed in ${totalTime.toFixed(2)}ms`);
    });

    test('should efficiently query large dataset', async () => {
      // First, create a larger dataset
      const batchPromises = Array.from({ length: 5 }, (_, batchIndex) =>
        Promise.all(
          Array.from({ length: 10 }, (_, index) =>
            request(app)
              .post('/api/expenses')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                amount: 15 + (batchIndex * 10) + index,
                category: 'Entertainment',
                description: `Dataset expense ${batchIndex}-${index}`,
                date: new Date(2024, 0, 15 + index).toISOString().split('T')[0]
              })
          )
        )
      );

      await Promise.all(batchPromises);

      // Now test querying the larger dataset
      const start = performance.now();
      
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const end = performance.now();
      const queryTime = end - start;

      // Should efficiently query even larger datasets
      expect(queryTime).toBeLessThan(1000);
      expect(response.body.length).toBeGreaterThan(80); // Should have many expenses now

      console.log(`Queried ${response.body.length} expenses in ${queryTime.toFixed(2)}ms`);
    });

    test('should handle date range filtering efficiently', async () => {
      const start = performance.now();
      
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      const end = performance.now();
      const queryTime = end - start;

      // Date range filtering should be fast
      expect(queryTime).toBeLessThan(500);

      console.log(`Date range query returned ${response.body.length} expenses in ${queryTime.toFixed(2)}ms`);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should not cause memory leaks with repeated operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform many operations
      for (let i = 0; i < 50; i++) {
        await request(app)
          .post('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 5,
            category: 'Other',
            description: `Memory test ${i}`
          });
        
        await request(app)
          .get('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(`Memory increase after 100 operations: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('should handle large payload efficiently', async () => {
      const largeDescription = 'A'.repeat(1000); // 1KB description
      
      const start = performance.now();
      
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          category: 'Food',
          description: largeDescription
        })
        .expect(201);

      const end = performance.now();
      const responseTime = end - start;

      // Should handle larger payloads without significant performance impact
      expect(responseTime).toBeLessThan(800);
    });
  });

  describe('Database Performance', () => {
    test('should efficiently aggregate budget data', async () => {
      // Create multiple budgets for different categories
      const categories = ['Food', 'Transportation', 'Entertainment', 'Healthcare'];
      
      for (const category of categories) {
        await request(app)
          .post('/api/budgets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            category,
            amount: 500.00,
            period: 'monthly',
            year: 2024,
            month: 2
          });
      }

      const start = performance.now();
      
      const response = await request(app)
        .get('/api/budgets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 2 })
        .expect(200);

      const end = performance.now();
      const aggregationTime = end - start;

      // Aggregation should be efficient even with multiple categories
      expect(aggregationTime).toBeLessThan(1000);
      expect(response.body.length).toBe(categories.length);

      console.log(`Budget aggregation for ${categories.length} categories completed in ${aggregationTime.toFixed(2)}ms`);
    });

    test('should handle complex queries efficiently', async () => {
      const start = performance.now();
      
      // Query with multiple filters
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          category: 'Food',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(200);

      const end = performance.now();
      const queryTime = end - start;

      // Complex queries should still be fast
      expect(queryTime).toBeLessThan(600);

      console.log(`Complex query returned ${response.body.length} results in ${queryTime.toFixed(2)}ms`);
    });
  });

  describe('Optimization Opportunities', () => {
    test('should demonstrate pagination need for large datasets', async () => {
      // This test shows when pagination becomes necessary
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dataSize = JSON.stringify(response.body).length;
      const expenseCount = response.body.length;

      console.log(`Retrieved ${expenseCount} expenses, response size: ${(dataSize / 1024).toFixed(2)}KB`);

      // If we have many expenses, the response gets large
      if (expenseCount > 100) {
        console.log('OPTIMIZATION: Consider implementing pagination for expense lists');
      }

      if (dataSize > 100 * 1024) { // 100KB
        console.log('OPTIMIZATION: Response size is large, pagination recommended');
      }
    });

    test('should identify slow operations', async () => {
      const operations = [];

      // Test various operations and their performance
      const testOperations = [
        {
          name: 'Create Expense',
          test: () => request(app)
            .post('/api/expenses')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 25, category: 'Food', description: 'Performance test' })
        },
        {
          name: 'Get Expenses',
          test: () => request(app)
            .get('/api/expenses')
            .set('Authorization', `Bearer ${authToken}`)
        },
        {
          name: 'Get Budget Summary',
          test: () => request(app)
            .get('/api/budgets/summary')
            .set('Authorization', `Bearer ${authToken}`)
            .query({ year: 2024, month: 1 })
        }
      ];

      for (const operation of testOperations) {
        const start = performance.now();
        await operation.test();
        const end = performance.now();
        const time = end - start;

        operations.push({ name: operation.name, time });
      }

      // Log performance results
      operations.forEach(op => {
        console.log(`${op.name}: ${op.time.toFixed(2)}ms`);
        
        if (op.time > 1000) {
          console.log(`WARNING: ${op.name} is slow (${op.time.toFixed(2)}ms)`);
        }
      });

      // Find the slowest operation
      const slowest = operations.reduce((prev, current) => 
        prev.time > current.time ? prev : current
      );

      console.log(`Slowest operation: ${slowest.name} (${slowest.time.toFixed(2)}ms)`);
    });
  });

  describe('Scalability Assessment', () => {
    test('should assess response time degradation with data growth', async () => {
      const measurements = [];

      // Measure performance at different data sizes
      for (let dataSize of [10, 50, 100]) {
        // Create batch of expenses
        const promises = Array.from({ length: dataSize }, (_, i) =>
          request(app)
            .post('/api/expenses')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              amount: 10 + i,
              category: 'Testing',
              description: `Scalability test ${i}`
            })
        );

        await Promise.all(promises);

        // Measure query time
        const start = performance.now();
        const response = await request(app)
          .get('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        const end = performance.now();

        measurements.push({
          dataSize: response.body.length,
          queryTime: end - start
        });
      }

      // Log scalability results
      measurements.forEach(m => {
        console.log(`${m.dataSize} expenses: ${m.queryTime.toFixed(2)}ms`);
      });

      // Check if performance degrades linearly or worse
      if (measurements.length >= 2) {
        const lastMeasurement = measurements[measurements.length - 1];
        const firstMeasurement = measurements[0];
        
        const timeRatio = lastMeasurement.queryTime / firstMeasurement.queryTime;
        const dataRatio = lastMeasurement.dataSize / firstMeasurement.dataSize;

        console.log(`Performance scaling: ${timeRatio.toFixed(2)}x time for ${dataRatio.toFixed(2)}x data`);

        if (timeRatio > dataRatio * 2) {
          console.log('WARNING: Performance degrades worse than linearly with data growth');
        }
      }
    });
  });
});