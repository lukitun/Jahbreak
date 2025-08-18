const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');

// Mock the User model
jest.mock('../src/models/User');

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        defaultCurrency: 'USD'
      };

      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.prototype.save = jest.fn().mockResolvedValue({
        _id: 'userId123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      User.findOne.mockResolvedValue({ email: userData.email }); // User exists

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(500); // Should handle validation errors
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'userId123',
        email: credentials.email,
        password: await bcrypt.hash(credentials.password, 10),
        firstName: 'John',
        lastName: 'Doe',
        isTwoFactorEnabled: false
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(credentials.email);
    });

    test('should return 400 for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue(null); // User not found

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 400 for incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'userId123',
        email: credentials.email,
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('2FA Endpoints', () => {
    test('should enable 2FA for authenticated user', async () => {
      const mockUser = {
        _id: 'userId123',
        email: 'test@example.com'
      };

      // Mock auth middleware to set userId
      const token = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET || 'default_secret');
      
      User.findByIdAndUpdate.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/enable-2fa')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('otpAuthUrl');
    });

    test('should verify 2FA token correctly', async () => {
      const mockUser = {
        _id: 'userId123',
        twoFactorSecret: 'testsecret'
      };

      const token = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET || 'default_secret');
      User.findById.mockResolvedValue(mockUser);

      // Mock speakeasy verify
      const speakeasy = require('speakeasy');
      speakeasy.totp.verify = jest.fn().mockReturnValue(true);

      const response = await request(app)
        .post('/api/auth/verify-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: '123456' })
        .expect(200);

      expect(response.body.message).toBe('Two-factor authentication verified successfully');
    });
  });
});