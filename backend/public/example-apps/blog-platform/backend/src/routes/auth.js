const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  logoutAll,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  getSessions,
  revokeSession
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateIdParam
} = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);
router.post('/password-reset/request', passwordResetLimiter, requestPasswordReset);
router.post('/password-reset/confirm', passwordResetLimiter, resetPassword);

// Protected routes
router.use(authenticateToken);

router.get('/me', getCurrentUser);
router.put('/me', validateUserUpdate, updateProfile);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.post('/change-password', changePassword);
router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', validateIdParam, revokeSession);

module.exports = router;