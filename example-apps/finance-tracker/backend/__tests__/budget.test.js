const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const Budget = require('../src/models/Budget');
const Expense = require('../src/models/Expense');

// Mock the models
jest.mock('../src/models/Budget');
jest.mock('../src/models/Expense');

describe('Budget Endpoints', () => {
  let authToken;
  const userId = 'userId123';

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'default_secret');
  });

  describe('POST /api/budgets', () => {
    test('should create monthly budget successfully', async () => {
      const budgetData = {
        category: 'Food',
        amount: 500.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      const mockBudget = {
        _id: 'budgetId123',
        user: userId,
        ...budgetData,
        save: jest.fn().mockResolvedValue(true)
      };

      Budget.findOne.mockResolvedValue(null); // No existing budget
      Budget.mockImplementation(() => mockBudget);

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.category).toBe(budgetData.category);
      expect(response.body.amount).toBe(budgetData.amount);
      expect(response.body.period).toBe(budgetData.period);
    });

    test('should create yearly budget successfully', async () => {
      const budgetData = {
        category: 'Transportation',
        amount: 6000.00,
        period: 'yearly',
        year: 2024
      };

      const mockBudget = {
        _id: 'budgetId123',
        user: userId,
        ...budgetData,
        save: jest.fn().mockResolvedValue(true)
      };

      Budget.findOne.mockResolvedValue(null);
      Budget.mockImplementation(() => mockBudget);

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.period).toBe('yearly');
      expect(response.body.year).toBe(2024);
      expect(response.body).not.toHaveProperty('month');
    });

    test('should return 400 if budget already exists', async () => {
      const budgetData = {
        category: 'Food',
        amount: 500.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      Budget.findOne.mockResolvedValue({ _id: 'existingBudget' }); // Existing budget

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(400);

      expect(response.body.message).toBe('Budget for this category and period already exists');
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        category: 'Food'
        // Missing amount, period, year
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(500); // Should trigger validation error
    });

    test('should require authentication', async () => {
      const budgetData = {
        category: 'Food',
        amount: 500.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      const response = await request(app)
        .post('/api/budgets')
        .send(budgetData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('GET /api/budgets', () => {
    test('should fetch user budgets', async () => {
      const mockBudgets = [
        {
          _id: 'budget1',
          user: userId,
          category: 'Food',
          amount: 500.00,
          period: 'monthly',
          year: 2024,
          month: 1
        },
        {
          _id: 'budget2',
          user: userId,
          category: 'Transportation',
          amount: 6000.00,
          period: 'yearly',
          year: 2024
        }
      ];

      Budget.find.mockResolvedValue(mockBudgets);

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].category).toBe('Food');
      expect(response.body[1].category).toBe('Transportation');
    });

    test('should filter budgets by year', async () => {
      const mockBudgets = [
        {
          _id: 'budget1',
          user: userId,
          category: 'Food',
          amount: 500.00,
          period: 'monthly',
          year: 2024,
          month: 1
        }
      ];

      Budget.find.mockResolvedValue(mockBudgets);

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024 })
        .expect(200);

      expect(Budget.find).toHaveBeenCalledWith({
        user: userId,
        year: 2024
      });
    });

    test('should filter budgets by period', async () => {
      Budget.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'monthly' })
        .expect(200);

      expect(Budget.find).toHaveBeenCalledWith({
        user: userId,
        period: 'monthly'
      });
    });

    test('should filter budgets by category', async () => {
      Budget.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'Food' })
        .expect(200);

      expect(Budget.find).toHaveBeenCalledWith({
        user: userId,
        category: 'Food'
      });
    });
  });

  describe('GET /api/budgets/summary', () => {
    test('should fetch budget summary with expense calculations', async () => {
      const year = 2024;
      const month = 1;

      const mockBudgets = [
        {
          _id: 'budget1',
          user: userId,
          category: 'Food',
          amount: 500.00,
          period: 'monthly',
          year: 2024,
          month: 1
        },
        {
          _id: 'budget2',
          user: userId,
          category: 'Transportation',
          amount: 6000.00,
          period: 'yearly',
          year: 2024
        }
      ];

      Budget.find.mockResolvedValue(mockBudgets);

      // Mock expense aggregation for each budget
      Expense.aggregate
        .mockResolvedValueOnce([{ totalExpense: 350.00 }]) // Food: 70% spent
        .mockResolvedValueOnce([{ totalExpense: 1200.00 }]); // Transportation: 20% spent

      const response = await request(app)
        .get('/api/budgets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year, month })
        .expect(200);

      expect(response.body).toHaveLength(2);
      
      const foodBudget = response.body.find(b => b.category === 'Food');
      expect(foodBudget.budgetAmount).toBe(500.00);
      expect(foodBudget.totalExpense).toBe(350.00);
      expect(foodBudget.percentageSpent).toBe(70);

      const transportBudget = response.body.find(b => b.category === 'Transportation');
      expect(transportBudget.budgetAmount).toBe(6000.00);
      expect(transportBudget.totalExpense).toBe(1200.00);
      expect(transportBudget.percentageSpent).toBe(20);
    });

    test('should handle budgets with no expenses', async () => {
      const mockBudgets = [
        {
          _id: 'budget1',
          user: userId,
          category: 'Entertainment',
          amount: 200.00,
          period: 'monthly',
          year: 2024,
          month: 1
        }
      ];

      Budget.find.mockResolvedValue(mockBudgets);
      Expense.aggregate.mockResolvedValue([]); // No expenses

      const response = await request(app)
        .get('/api/budgets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].totalExpense).toBe(0);
      expect(response.body[0].percentageSpent).toBe(0);
    });
  });

  describe('PUT /api/budgets/:id', () => {
    test('should update budget successfully', async () => {
      const budgetId = 'budget123';
      const updateData = {
        amount: 600.00,
        category: 'Shopping'
      };

      const updatedBudget = {
        _id: budgetId,
        user: userId,
        ...updateData,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      Budget.findOneAndUpdate.mockResolvedValue(updatedBudget);

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.amount).toBe(updateData.amount);
      expect(response.body.category).toBe(updateData.category);
    });

    test('should return 404 if budget not found', async () => {
      const budgetId = 'nonexistent';
      
      Budget.findOneAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 600 })
        .expect(404);

      expect(response.body.message).toBe('Budget not found');
    });

    test('should only update user own budgets', async () => {
      const budgetId = 'budget123';
      const updateData = { amount: 600.00 };

      Budget.findOneAndUpdate.mockResolvedValue(null);

      await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(Budget.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: budgetId, user: userId },
        updateData,
        { new: true }
      );
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    test('should delete budget successfully', async () => {
      const budgetId = 'budget123';
      
      const deletedBudget = {
        _id: budgetId,
        user: userId,
        category: 'Food',
        amount: 500.00
      };

      Budget.findOneAndDelete.mockResolvedValue(deletedBudget);

      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Budget deleted successfully');
    });

    test('should return 404 if budget not found', async () => {
      const budgetId = 'nonexistent';
      
      Budget.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Budget not found');
    });

    test('should only delete user own budgets', async () => {
      const budgetId = 'budget123';

      Budget.findOneAndDelete.mockResolvedValue(null);

      await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(Budget.findOneAndDelete).toHaveBeenCalledWith({
        _id: budgetId,
        user: userId
      });
    });
  });

  describe('Budget Validation', () => {
    test('should validate budget amount is positive', async () => {
      const invalidBudget = {
        category: 'Food',
        amount: -100.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      Budget.findOne.mockResolvedValue(null);
      Budget.mockImplementation(() => {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        throw error;
      });

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBudget)
        .expect(500);
    });

    test('should require month for monthly budgets', async () => {
      const invalidBudget = {
        category: 'Food',
        amount: 500.00,
        period: 'monthly',
        year: 2024
        // Missing month
      };

      Budget.findOne.mockResolvedValue(null);
      Budget.mockImplementation(() => {
        const error = new Error('Month is required for monthly budgets');
        error.name = 'ValidationError';
        throw error;
      });

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBudget)
        .expect(500);
    });
  });
});