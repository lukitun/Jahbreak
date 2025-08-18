const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validate, userRegistrationSchema, userLoginSchema } = require('../middleware/validation');
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', validate(userRegistrationSchema), register);
router.post('/login', validate(userLoginSchema), login);

// Protected routes
router.use(authenticateToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

module.exports = router;