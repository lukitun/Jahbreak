import express from 'express';
import { 
  generateMonthlyReport, 
  generateAnnualReport 
} from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Monthly report route with validation
router.get('/monthly', [
  authMiddleware,
  query('year').isInt({ min: 2020 }).withMessage('Invalid year'),
  query('month').isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
], validateRequest, generateMonthlyReport);

// Annual report route with validation
router.get('/annual', [
  authMiddleware,
  query('year').isInt({ min: 2020 }).withMessage('Invalid year'),
], validateRequest, generateAnnualReport);

export default router;