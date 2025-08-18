import express from 'express';
import { 
  createBudget, 
  getBudgets, 
  getBudgetSummary, 
  updateBudget, 
  deleteBudget 
} from '../controllers/budgetController';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create budget route with validation
router.post('/', [
  authMiddleware,
  body('category').isIn([
    'Food', 'Housing', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Other'
  ]).withMessage('Invalid budget category'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('period').isIn(['monthly', 'yearly']).withMessage('Invalid budget period'),
  body('year').isInt({ min: 2020 }).withMessage('Invalid year'),
  body('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
], validateRequest, createBudget);

// Get budgets route with validation
router.get('/', [
  authMiddleware,
  query('year').optional().isInt({ min: 2020 }).withMessage('Invalid year'),
  query('period').optional().isIn(['monthly', 'yearly']).withMessage('Invalid budget period'),
  query('category').optional().isIn([
    'Food', 'Housing', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Other'
  ]).withMessage('Invalid budget category'),
], validateRequest, getBudgets);

// Get budget summary route with validation
router.get('/summary', [
  authMiddleware,
  query('year').isInt({ min: 2020 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
], validateRequest, getBudgetSummary);

// Update budget route with validation
router.put('/:id', [
  authMiddleware,
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn([
    'Food', 'Housing', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Other'
  ]).withMessage('Invalid budget category'),
], validateRequest, updateBudget);

// Delete budget route
router.delete('/:id', authMiddleware, deleteBudget);

export default router;