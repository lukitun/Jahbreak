import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
} from '../controllers/expenseController';
import { validateExpense, validateRequest } from '../middleware/validation';
import { upload } from '../utils/cloudinary';

const router = express.Router();

// Get expense statistics
router.get('/stats', getExpenseStats);

// CRUD operations
router.post('/', 
  upload.single('receipt'), 
  validateExpense, 
  validateRequest, 
  createExpense
);

router.get('/', getExpenses);
router.get('/:id', getExpenseById);

router.put('/:id', 
  upload.single('receipt'), 
  validateExpense, 
  validateRequest, 
  updateExpense
);

router.delete('/:id', deleteExpense);

export default router;