import express from 'express';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
  getBudgetSummary
} from '../controllers/budgetController';
import { validateBudget, validateRequest } from '../middleware/validation';

const router = express.Router();

// Get budget summary
router.get('/summary', getBudgetSummary);

// CRUD operations
router.post('/', validateBudget, validateRequest, createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.put('/:id', validateBudget, validateRequest, updateBudget);
router.delete('/:id', deleteBudget);

// Budget progress
router.get('/:id/progress', getBudgetProgress);

export default router;