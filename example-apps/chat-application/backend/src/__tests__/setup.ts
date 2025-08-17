import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/chatapp_test';

// Global test setup
beforeAll(async () => {
  // Any global setup needed for tests
});

afterAll(async () => {
  // Global cleanup
});