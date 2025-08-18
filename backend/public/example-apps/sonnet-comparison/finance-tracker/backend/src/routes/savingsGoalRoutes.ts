import express from 'express';
import {
  createSavingsGoal,
  getSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
  addToSavingsGoal,
  withdrawFromSavingsGoal,
  getSavingsGoalsSummary
} from '../controllers/savingsGoalController';
import { validateSavingsGoal, validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = express.Router();

// Get savings goals summary
router.get('/summary', getSavingsGoalsSummary);

// CRUD operations
router.post('/', validateSavingsGoal, validateRequest, createSavingsGoal);
router.get('/', getSavingsGoals);
router.get('/:id', getSavingsGoalById);
router.put('/:id', validateSavingsGoal, validateRequest, updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);

// Savings goal transactions
router.post('/:id/add',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('note').optional().trim().isLength({ max: 200 }).withMessage('Note must be less than 200 characters')
  ],
  validateRequest,
  addToSavingsGoal
);

router.post('/:id/withdraw',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('note').optional().trim().isLength({ max: 200 }).withMessage('Note must be less than 200 characters')
  ],
  validateRequest,
  withdrawFromSavingsGoal
);

export default router;