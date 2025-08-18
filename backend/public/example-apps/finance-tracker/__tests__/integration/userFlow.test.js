const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend/src/server');
const User = require('../../backend/src/models/User');
const Expense = require('../../backend/src/models/Expense');
const Budget = require('../../backend/src/models/Budget');

describe('Integration Tests - Complete User Flows', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/finance_tracker_test');
    }
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Complete User Registration and Setup Flow', () => {
    test('should register user, set up budget, add expenses, and view dashboard', async () => {
      // Step 1: Register new user
      const userData = {
        email: 'integration@test.com',
        password: 'password123',
        firstName: 'Integration',
        lastName: 'Test',
        defaultCurrency: 'USD'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('token');
      expect(registerResponse.body.user.email).toBe(userData.email);
      
      authToken = registerResponse.body.token;
      testUser = registerResponse.body.user;

      // Step 2: Create monthly budget for Food category
      const budgetData = {
        category: 'Food',
        amount: 500.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      const budgetResponse = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(budgetResponse.body.category).toBe('Food');
      expect(budgetResponse.body.amount).toBe(500.00);

      // Step 3: Add expense within budget
      const expense1Data = {
        amount: 150.00,
        category: 'Food',
        description: 'Groceries',
        date: '2024-01-15',
        currency: 'USD'
      };

      const expense1Response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expense1Data)
        .expect(201);

      expect(expense1Response.body.expense.amount).toBe(150.00);
      expect(expense1Response.body).not.toHaveProperty('budgetAlert');

      // Step 4: Add expense that triggers budget warning (80% threshold)
      const expense2Data = {
        amount: 250.00, // Total will be 400/500 = 80%
        category: 'Food',
        description: 'Restaurant meal',
        date: '2024-01-20'
      };

      const expense2Response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expense2Data)
        .expect(201);

      expect(expense2Response.body).toHaveProperty('budgetAlert');
      expect(expense2Response.body.budgetAlert.percentage).toBe(80);
      expect(expense2Response.body.budgetAlert.message).toBe('Budget is 80% utilized');

      // Step 5: Add expense that exceeds budget
      const expense3Data = {
        amount: 200.00, // Total will be 600/500 = 120%
        category: 'Food',
        description: 'Expensive dinner',
        date: '2024-01-25'
      };

      const expense3Response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expense3Data)
        .expect(201);

      expect(expense3Response.body).toHaveProperty('budgetAlert');
      expect(expense3Response.body.budgetAlert.percentage).toBe(120);
      expect(expense3Response.body.budgetAlert.message).toBe('Budget fully exceeded!');

      // Step 6: Verify all expenses are retrievable
      const expensesResponse = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(expensesResponse.body).toHaveLength(3);

      // Step 7: Get budget summary
      const summaryResponse = await request(app)
        .get('/api/budgets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 })
        .expect(200);

      expect(summaryResponse.body).toHaveLength(1);
      expect(summaryResponse.body[0].category).toBe('Food');
      expect(summaryResponse.body[0].totalExpense).toBe(600.00);
      expect(summaryResponse.body[0].percentageSpent).toBe(120);
    });
  });

  describe('Expense Management Flow', () => {
    beforeEach(async () => {
      // Set up authenticated user
      const userData = {
        email: 'expense@test.com',
        password: 'password123',
        firstName: 'Expense',
        lastName: 'User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      authToken = registerResponse.body.token;
    });

    test('should create, update, and delete expenses', async () => {
      // Create expense
      const expenseData = {
        amount: 75.50,
        category: 'Transportation',
        description: 'Gas',
        date: '2024-01-15'
      };

      const createResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      const expenseId = createResponse.body.expense._id;

      // Update expense
      const updateData = {
        amount: 85.00,
        description: 'Gas + parking'
      };

      const updateResponse = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.amount).toBe(85.00);
      expect(updateResponse.body.description).toBe('Gas + parking');

      // Verify update
      const getResponse = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body).toHaveLength(1);
      expect(getResponse.body[0].amount).toBe(85.00);

      // Delete expense
      await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      const finalGetResponse = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalGetResponse.body).toHaveLength(0);
    });
  });

  describe('Budget Management Flow', () => {
    beforeEach(async () => {
      const userData = {
        email: 'budget@test.com',
        password: 'password123',
        firstName: 'Budget',
        lastName: 'User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      authToken = registerResponse.body.token;
    });

    test('should create multiple budgets and manage them', async () => {
      // Create monthly budget
      const monthlyBudget = {
        category: 'Food',
        amount: 400.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      const monthlyResponse = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(monthlyBudget)
        .expect(201);

      // Create yearly budget
      const yearlyBudget = {
        category: 'Transportation',
        amount: 5000.00,
        period: 'yearly',
        year: 2024
      };

      const yearlyResponse = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(yearlyBudget)
        .expect(201);

      // Verify both budgets exist
      const getAllResponse = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getAllResponse.body).toHaveLength(2);

      // Update monthly budget
      const updateData = { amount: 450.00 };
      
      const updateResponse = await request(app)
        .put(`/api/budgets/${monthlyResponse.body._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.amount).toBe(450.00);

      // Try to create duplicate budget (should fail)
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(monthlyBudget)
        .expect(400);

      // Delete yearly budget
      await request(app)
        .delete(`/api/budgets/${yearlyResponse.body._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify only monthly budget remains
      const finalGetResponse = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalGetResponse.body).toHaveLength(1);
      expect(finalGetResponse.body[0].period).toBe('monthly');
    });
  });

  describe('Authentication Flow', () => {
    test('should handle complete authentication workflow', async () => {
      const userData = {
        email: 'auth@test.com',
        password: 'password123',
        firstName: 'Auth',
        lastName: 'Test'
      };

      // Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('token');
      const token1 = registerResponse.body.token;

      // Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      const token2 = loginResponse.body.token;

      // Both tokens should work for authenticated requests
      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      // Try login with wrong password
      await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(400);

      // Try accessing protected route without token
      await request(app)
        .get('/api/expenses')
        .expect(401);
    });

    test('should prevent access to other users data', async () => {
      // Create two users
      const user1Data = {
        email: 'user1@test.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One'
      };

      const user2Data = {
        email: 'user2@test.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Two'
      };

      const user1Response = await request(app)
        .post('/api/auth/register')
        .send(user1Data)
        .expect(201);

      const user2Response = await request(app)
        .post('/api/auth/register')
        .send(user2Data)
        .expect(201);

      const token1 = user1Response.body.token;
      const token2 = user2Response.body.token;

      // User 1 creates an expense
      const expenseData = {
        amount: 100.00,
        category: 'Food',
        description: 'User 1 expense'
      };

      const expenseResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token1}`)
        .send(expenseData)
        .expect(201);

      const expenseId = expenseResponse.body.expense._id;

      // User 2 should not see User 1's expenses
      const user2ExpensesResponse = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(user2ExpensesResponse.body).toHaveLength(0);

      // User 2 should not be able to update User 1's expense
      await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ amount: 200.00 })
        .expect(404);

      // User 2 should not be able to delete User 1's expense
      await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      // User 1 should still see their expense
      const user1ExpensesResponse = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(user1ExpensesResponse.body).toHaveLength(1);
    });
  });

  describe('Error Handling Flow', () => {
    beforeEach(async () => {
      const userData = {
        email: 'error@test.com',
        password: 'password123',
        firstName: 'Error',
        lastName: 'Test'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      authToken = registerResponse.body.token;
    });

    test('should handle various error scenarios gracefully', async () => {
      // Try to create expense with invalid category
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50.00,
          category: 'InvalidCategory',
          description: 'Test'
        })
        .expect(500); // Should trigger validation error

      // Try to update non-existent expense
      await request(app)
        .put('/api/expenses/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100.00 })
        .expect(500); // Invalid ObjectId format

      // Try to delete non-existent expense
      await request(app)
        .delete('/api/expenses/507f1f77bcf86cd799439011') // Valid ObjectId format
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Try to create budget with invalid period
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Food',
          amount: 500.00,
          period: 'invalid_period',
          year: 2024
        })
        .expect(500); // Should trigger validation error
    });
  });
});