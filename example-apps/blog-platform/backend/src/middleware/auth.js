const jwt = require('jsonwebtoken');
const { User, Session } = require('../../../database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session is still active
    const session = await Session.findOne({
      where: {
        sessionId: decoded.sessionId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!session || session.isExpired()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired or invalid' 
      });
    }

    req.user = session.user;
    req.sessionId = session.sessionId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const session = await Session.findOne({
        where: {
          sessionId: decoded.sessionId,
          isActive: true
        },
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      });

      if (session && !session.isExpired()) {
        req.user = session.user;
        req.sessionId = session.sessionId;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};