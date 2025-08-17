import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = express.Router();

// User profile management
router.get('/profile', getProfile);
router.put('/profile',
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('preferredCurrency').optional().isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'])
  ],
  validateRequest,
  updateProfile
);

router.post('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],
  validateRequest,
  changePassword
);

export default router;