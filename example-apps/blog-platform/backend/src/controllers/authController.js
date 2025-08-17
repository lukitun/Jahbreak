const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Session } = require('../../../database');
const { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } = require('../utils/email');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Create session
const createSession = async (user, req) => {
  const sessionId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await Session.create({
    sessionId,
    userId: user.id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    expiresAt
  });

  return sessionId;
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists'
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Create session
    const sessionId = await createSession(user, req);

    // Generate token
    const token = generateToken({
      userId: user.id,
      sessionId
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.scope('withPassword').findOne({
      where: { email }
    });

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Create session
    const sessionId = await createSession(user, req);

    // Generate token
    const token = generateToken({
      userId: user.id,
      sessionId
    });

    // Update last login
    await user.update({ lastLogin: new Date() });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Deactivate session
    await Session.update(
      { isActive: false },
      { 
        where: { 
          sessionId: req.sessionId,
          userId: req.user.id 
        } 
      }
    );

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Logout from all devices
const logoutAll = async (req, res) => {
  try {
    // Deactivate all sessions for user
    await Session.update(
      { isActive: false },
      { 
        where: { 
          userId: req.user.id,
          isActive: true
        } 
      }
    );

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    logger.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar } = req.body;
    
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      bio: bio !== undefined ? bio : req.user.bio,
      avatar: avatar !== undefined ? avatar : req.user.avatar
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!await user.comparePassword(currentPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    await user.update({ password: newPassword });

    // Logout from all other sessions
    await Session.update(
      { isActive: false },
      { 
        where: { 
          userId: req.user.id,
          sessionId: { $ne: req.sessionId }
        } 
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    logger.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    await user.update({ password: newPassword });

    // Logout from all sessions
    await Session.update(
      { isActive: false },
      { where: { userId: user.id } }
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Get user sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { 
        userId: req.user.id,
        isActive: true
      },
      attributes: ['sessionId', 'ipAddress', 'userAgent', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions'
    });
  }
};

// Revoke session
const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await Session.update(
      { isActive: false },
      { 
        where: { 
          sessionId,
          userId: req.user.id 
        } 
      }
    );

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    logger.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session'
    });
  }
};

module.exports = {
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
};