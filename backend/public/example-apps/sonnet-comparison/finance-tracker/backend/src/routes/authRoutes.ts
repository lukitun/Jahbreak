import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  refreshToken
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  validateUserRegistration,
  validateUserLogin,
  validateRequest
} from '../middleware/validation';
import { body } from 'express-validator';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, validateRequest, register);
router.post('/login', validateUserLogin, validateRequest, login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', 
  authMiddleware,
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('preferredCurrency').optional().isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'])
  ],
  validateRequest,
  updateProfile
);

router.post('/change-password',
  authMiddleware,
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

// Two-Factor Authentication routes
router.post('/2fa/setup', authMiddleware, setup2FA);
router.post('/2fa/verify',
  authMiddleware,
  [
    body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
  ],
  validateRequest,
  verify2FA
);
router.post('/2fa/disable',
  authMiddleware,
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  disable2FA
);

// Token refresh
router.post('/refresh-token', authMiddleware, refreshToken);

export default router;