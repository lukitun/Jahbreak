const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const Expense = require('../src/models/Expense');
const Budget = require('../src/models/Budget');

// Mock the models
jest.mock('../src/models/Expense');
jest.mock('../src/models/Budget');

describe('Expense Endpoints', () => {
  let authToken;
  const userId = 'userId123';

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'default_secret');
  });

  describe('POST /api/expenses', () => {
    test('should create expense successfully', async () => {
      const expenseData = {
        amount: 50.00,
        category: 'Food',
        description: 'Lunch',
        date: '2024-01-15',
        currency: 'USD'
      };

      const mockExpense = {
        _id: 'expenseId123',
        user: userId,
        ...expenseData,
        save: jest.fn().mockResolvedValue(true)
      };

      Budget.findOne.mockResolvedValue(null); // No budget for category
      Expense.mockImplementation(() => mockExpense);

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      expect(response.body).toHaveProperty('expense');
      expect(response.body.expense.amount).toBe(expenseData.amount);
      expect(response.body.expense.category).toBe(expenseData.category);
    });

    test('should create expense with budget alert', async () => {
      const expenseData = {
        amount: 100.00,
        category: 'Food',
        description: 'Expensive meal',
        date: '2024-01-15'
      };

      const mockBudget = {
        _id: 'budgetId123',
        user: userId,
        category: 'Food',
        amount: 200.00,
        period: 'monthly',
        year: 2024,
        month: 1
      };

      const mockExpense = {
        _id: 'expenseId123',
        user: userId,
        ...expenseData,
        save: jest.fn().mockResolvedValue(true)
      };

      Budget.findOne.mockResolvedValue(mockBudget);
      Expense.mockImplementation(() => mockExpense);
      
      // Mock aggregate to return total expense of 180 (90% of budget)
      Expense.aggregate.mockResolvedValue([{ totalExpense: 180 }]);

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      expect(response.body).toHaveProperty('budgetAlert');
      expect(response.body.budgetAlert.percentage).toBe(90);
      expect(response.body.budgetAlert.message).toBe('Budget is 80% utilized');
    });

    test('should handle file upload for receipt', async () => {
      const expenseData = {
        amount: 25.00,
        category: 'Shopping',
        description: 'Receipt test'
      };

      const mockExpense = {
        _id: 'expenseId123',
        user: userId,
        ...expenseData,
        receiptImage: 'https://cloudinary.com/receipt.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      Budget.findOne.mockResolvedValue(null);
      Expense.mockImplementation(() => mockExpense);

      // Mock cloudinary upload
      const cloudinary = require('../src/utils/cloudinaryConfig');
      cloudinary.uploader.upload = jest.fn().mockResolvedValue({
        secure_url: 'https://cloudinary.com/receipt.jpg'
      });

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .field('amount', expenseData.amount)
        .field('category', expenseData.category)
        .field('description', expenseData.description)
        .attach('receipt', Buffer.from('fake image data'), 'receipt.jpg')
        .expect(201);

      expect(response.body.expense.receiptImage).toBe('https://cloudinary.com/receipt.jpg');
    });

    test('should require authentication', async () => {
      const expenseData = {
        amount: 50.00,
        category: 'Food'
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('GET /api/expenses', () => {
    test('should fetch user expenses', async () => {
      const mockExpenses = [
        {
          _id: 'expense1',
          user: userId,
          amount: 50.00,
          category: 'Food',
          date: '2024-01-15'
        },
        {
          _id: 'expense2',
          user: userId,
          amount: 30.00,
          category: 'Transportation',
          date: '2024-01-14'
        }
      ];

      Expense.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExpenses)
      });

      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]._id).toBe('expense1');
    });

    test('should filter expenses by date range', async () => {
      const mockExpenses = [
        {
          _id: 'expense1',
          user: userId,
          amount: 50.00,
          category: 'Food',
          date: '2024-01-15'
        }
      ];

      Expense.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExpenses)
      });

      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(Expense.find).toHaveBeenCalledWith({
        user: userId,
        date: {
          $gte: new Date('2024-01-01'),
          $lte: new Date('2024-01-31')
        }
      });
    });

    test('should filter expenses by category', async () => {
      const mockExpenses = [
        {
          _id: 'expense1',
          user: userId,
          amount: 50.00,
          category: 'Food',
          date: '2024-01-15'
        }
      ];

      Expense.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExpenses)
      });

      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'Food' })
        .expect(200);

      expect(Expense.find).toHaveBeenCalledWith({
        user: userId,
        category: 'Food'
      });
    });
  });

  describe('PUT /api/expenses/:id', () => {
    test('should update expense successfully', async () => {
      const expenseId = 'expense123';
      const updateData = {
        amount: 75.00,
        category: 'Entertainment',
        description: 'Updated expense'
      };

      const updatedExpense = {
        _id: expenseId,
        user: userId,
        ...updateData
      };

      Expense.findOneAndUpdate.mockResolvedValue(updatedExpense);

      const response = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.amount).toBe(updateData.amount);
      expect(response.body.category).toBe(updateData.category);
    });

    test('should return 404 if expense not found', async () => {
      const expenseId = 'nonexistent';
      
      Expense.findOneAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100 })
        .expect(404);

      expect(response.body.message).toBe('Expense not found');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    test('should delete expense successfully', async () => {
      const expenseId = 'expense123';
      
      const deletedExpense = {
        _id: expenseId,
        user: userId,
        receiptImage: null
      };

      Expense.findOneAndDelete.mockResolvedValue(deletedExpense);

      const response = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Expense deleted successfully');
    });

    test('should delete receipt image from cloudinary', async () => {
      const expenseId = 'expense123';
      
      const deletedExpense = {
        _id: expenseId,
        user: userId,
        receiptImage: 'https://cloudinary.com/receipts/receipt123.jpg'
      };

      Expense.findOneAndDelete.mockResolvedValue(deletedExpense);

      const cloudinary = require('../src/utils/cloudinaryConfig');
      cloudinary.uploader.destroy = jest.fn().mockResolvedValue({ result: 'ok' });

      const response = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('finance-tracker/receipts/receipt123');
    });

    test('should return 404 if expense not found', async () => {
      const expenseId = 'nonexistent';
      
      Expense.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Expense not found');
    });
  });

  describe('Input Validation', () => {
    test('should validate expense amount is positive', async () => {
      const invalidExpense = {
        amount: -50.00,
        category: 'Food'
      };

      // This test assumes proper validation middleware is implemented
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExpense)
        .expect(400);
    });

    test('should validate category is from allowed list', async () => {
      const invalidExpense = {
        amount: 50.00,
        category: 'InvalidCategory'
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExpense)
        .expect(500); // Would trigger model validation error
    });
  });
});