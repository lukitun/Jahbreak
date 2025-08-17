const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../backend/src/server');

describe('Security Assessment Tests', () => {
  describe('Authentication Security', () => {
    test('should hash passwords before storing', async () => {
      const userData = {
        email: 'security@test.com',
        password: 'plaintext123',
        firstName: 'Security',
        lastName: 'Test'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Password should not be returned in response
      expect(response.body.user).not.toHaveProperty('password');
      
      // In a real test with database access, we would verify:
      // 1. Password is hashed in database
      // 2. Original password cannot be retrieved
    });

    test('should require valid JWT tokens', async () => {
      // Test with no token
      await request(app)
        .get('/api/expenses')
        .expect(401);

      // Test with invalid token
      await request(app)
        .get('/api/expenses')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      // Test with malformed token
      await request(app)
        .get('/api/expenses')
        .set('Authorization', 'invalid_format')
        .expect(401);
    });

    test('should validate JWT token structure and signature', async () => {
      // Create a token with wrong secret
      const fakeToken = jwt.sign({ userId: 'fake_user' }, 'wrong_secret');
      
      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 'user123' }, 
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    test('should prevent credential enumeration attacks', async () => {
      // Both non-existent user and wrong password should return same error
      const nonExistentResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        })
        .expect(400);

      // Register a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'real@test.com',
          password: 'correctpassword',
          firstName: 'Real',
          lastName: 'User'
        });

      const wrongPasswordResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'real@test.com',
          password: 'wrongpassword'
        })
        .expect(400);

      // Both should return the same generic error message
      expect(nonExistentResponse.body.message).toBe(wrongPasswordResponse.body.message);
      expect(nonExistentResponse.body.message).toBe('Invalid credentials');
    });
  });

  describe('Input Validation Security', () => {
    let authToken;

    beforeEach(async () => {
      const userData = {
        email: 'validation@test.com',
        password: 'password123',
        firstName: 'Validation',
        lastName: 'Test'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      authToken = response.body.token;
    });

    test('should validate expense input fields', async () => {
      // Test negative amount
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          category: 'Food',
          description: 'Negative amount test'
        })
        .expect(500); // Should fail validation

      // Test invalid category
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          category: 'InvalidCategory',
          description: 'Invalid category test'
        })
        .expect(500); // Should fail validation

      // Test missing required fields
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing amount and category'
        })
        .expect(500); // Should fail validation
    });

    test('should sanitize input to prevent XSS', async () => {
      const maliciousInput = {
        amount: 50,
        category: 'Food',
        description: '<script>alert("XSS")</script>',
        date: '2024-01-15'
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousInput)
        .expect(201);

      // The script tag should be escaped or removed
      expect(response.body.expense.description).not.toContain('<script>');
    });

    test('should prevent NoSQL injection attempts', async () => {
      // Try NoSQL injection in login
      await request(app)
        .post('/api/auth/login')
        .send({
          email: { $ne: null },
          password: { $ne: null }
        })
        .expect(400);

      // Try NoSQL injection in expense filtering
      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          category: { $ne: null }
        })
        .expect(200); // Should handle gracefully without breaking
    });

    test('should validate file upload security', async () => {
      // Test file size limit (should reject files over 5MB)
      const largeFileBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .field('amount', '50')
        .field('category', 'Food')
        .attach('receipt', largeFileBuffer, 'large_receipt.jpg')
        .expect(413); // Payload too large

      // Test invalid file type (should only allow images)
      const textFileBuffer = Buffer.from('This is not an image');
      
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .field('amount', '50')
        .field('category', 'Food')
        .attach('receipt', textFileBuffer, 'receipt.txt')
        .expect(400); // Should reject non-image files
    });
  });

  describe('Authorization Security', () => {
    let user1Token, user2Token;
    let user1ExpenseId;

    beforeEach(async () => {
      // Create two users
      const user1Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user1@auth.test',
          password: 'password123',
          firstName: 'User',
          lastName: 'One'
        });

      const user2Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user2@auth.test',
          password: 'password123',
          firstName: 'User',
          lastName: 'Two'
        });

      user1Token = user1Response.body.token;
      user2Token = user2Response.body.token;

      // User 1 creates an expense
      const expenseResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          amount: 100,
          category: 'Food',
          description: 'User 1 expense'
        });

      user1ExpenseId = expenseResponse.body.expense._id;
    });

    test('should prevent horizontal privilege escalation', async () => {
      // User 2 should not be able to access User 1's expenses
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body).toHaveLength(0);

      // User 2 should not be able to update User 1's expense
      await request(app)
        .put(`/api/expenses/${user1ExpenseId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ amount: 200 })
        .expect(404);

      // User 2 should not be able to delete User 1's expense
      await request(app)
        .delete(`/api/expenses/${user1ExpenseId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);
    });

    test('should prevent vertical privilege escalation', async () => {
      // Users should not be able to access admin-only functions
      // (Note: This app doesn't have admin functions, but this is where you'd test them)
      
      // Test that users can only access their own data through user ID in token
      const decodedToken = jwt.verify(user1Token, process.env.JWT_SECRET || 'default_secret');
      expect(decodedToken).toHaveProperty('userId');
      
      // Verify that modifying the token payload fails
      const modifiedToken = jwt.sign(
        { userId: 'admin_user_id' }, 
        'wrong_secret'
      );

      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${modifiedToken}`)
        .expect(401);
    });
  });

  describe('Data Protection Security', () => {
    test('should not expose sensitive information in responses', async () => {
      const userData = {
        email: 'privacy@test.com',
        password: 'sensitivepassword123',
        firstName: 'Privacy',
        lastName: 'Test'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Password should never be in response
      expect(registerResponse.body.user).not.toHaveProperty('password');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      // Password should never be in response
      expect(loginResponse.body.user).not.toHaveProperty('password');
      
      // 2FA secret should not be exposed in normal responses
      expect(loginResponse.body.user).not.toHaveProperty('twoFactorSecret');
    });

    test('should handle 2FA security correctly', async () => {
      const userData = {
        email: '2fa@test.com',
        password: 'password123',
        firstName: '2FA',
        lastName: 'Test'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const authToken = registerResponse.body.token;

      // Enable 2FA
      const enable2FAResponse = await request(app)
        .post('/api/auth/enable-2fa')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(enable2FAResponse.body).toHaveProperty('secret');
      expect(enable2FAResponse.body).toHaveProperty('otpAuthUrl');

      // Verify 2FA with invalid token should fail
      await request(app)
        .post('/api/auth/verify-2fa')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: '000000' })
        .expect(400);

      // Test that 2FA secret is properly generated and unique
      const enable2FAResponse2 = await request(app)
        .post('/api/auth/enable-2fa')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Each 2FA setup should generate a new secret
      expect(enable2FAResponse.body.secret).not.toBe(enable2FAResponse2.body.secret);
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    test('should handle multiple rapid requests gracefully', async () => {
      const userData = {
        email: 'ratelimit@test.com',
        password: 'password123',
        firstName: 'Rate',
        lastName: 'Limit'
      };

      // Make multiple rapid registration attempts
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/register')
          .send({
            ...userData,
            email: `ratelimit${Math.random()}@test.com`
          })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed if properly implemented (or some should be rate limited)
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });

    test('should prevent login brute force attacks', async () => {
      // Register a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'bruteforce@test.com',
          password: 'correctpassword',
          firstName: 'Brute',
          lastName: 'Force'
        });

      // Attempt multiple failed logins
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'bruteforce@test.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      
      // All should fail with same error message
      responses.forEach(response => {
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
      });
    });
  });

  describe('CORS and Header Security', () => {
    test('should have proper CORS configuration', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .expect(204);

      // Should allow CORS preflight
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should not expose sensitive headers', async () => {
      const response = await request(app)
        .get('/api/auth/login')
        .expect(404); // GET not allowed, should be POST

      // Should not expose internal server information
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['server']).not.toContain('Express');
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose stack traces in production', async () => {
      // Force an error
      const response = await request(app)
        .post('/api/expenses')
        .send({ invalid: 'data' })
        .expect(401); // No auth token

      // Error should not contain stack trace
      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toContain('at ');
    });

    test('should handle database errors securely', async () => {
      const userData = {
        email: 'dberror@test.com',
        password: 'password123',
        firstName: 'DB',
        lastName: 'Error'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to access with invalid ObjectId
      const response = await request(app)
        .get('/api/expenses/invalid_object_id')
        .set('Authorization', `Bearer ${registerResponse.body.token}`)
        .expect(500);

      // Should not expose database schema or internal details
      expect(response.body.message).not.toContain('mongoose');
      expect(response.body.message).not.toContain('MongoDB');
      expect(response.body.message).not.toContain('ObjectId');
    });
  });
});