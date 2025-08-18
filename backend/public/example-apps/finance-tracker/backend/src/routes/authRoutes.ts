import express from 'express';
import { 
  register, 
  login, 
  enable2FA, 
  verify2FAToken 
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration route with validation
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], validateRequest, register);

// Login route with validation
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, login);

// Two-Factor Authentication Routes
router.post('/enable-2fa', authMiddleware, enable2FA);
router.post('/verify-2fa', authMiddleware, verify2FAToken);

export default router;