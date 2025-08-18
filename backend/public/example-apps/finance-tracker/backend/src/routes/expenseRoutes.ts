import express from 'express';
import { 
  createExpense, 
  getExpenses, 
  updateExpense, 
  deleteExpense 
} from '../controllers/expenseController';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file limit
});

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create expense route with validation
router.post('/', [
  authMiddleware,
  upload.single('receipt'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn([
    'Food', 'Housing', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Other'
  ]).withMessage('Invalid expense category'),
], validateRequest, createExpense);

// Get expenses route with validation
router.get('/', [
  authMiddleware,
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('category').optional().isIn([
    'Food', 'Housing', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Other'
  ]).withMessage('Invalid expense category'),
], validateRequest, getExpenses);

// Update expense route with validation
router.put('/:id', [
  authMiddleware,
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn([
    'Food', 'Housing', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Other'
  ]).withMessage('Invalid expense category'),
], validateRequest, updateExpense);

// Delete expense route
router.delete('/:id', authMiddleware, deleteExpense);

export default router;