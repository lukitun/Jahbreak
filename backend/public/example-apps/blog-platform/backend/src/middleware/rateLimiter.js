const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

let redisClient;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
  redisClient.connect();
}

// Redis store for rate limiting
const RedisStore = require('rate-limit-redis');

const createLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  const config = {
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests
  };

  if (redisClient) {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  }

  return rateLimit(config);
};

// General API rate limiter
const generalLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

// Strict rate limiter for authentication routes
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

// Comment creation rate limiter
const commentLimiter = createLimiter(
  5 * 60 * 1000, // 5 minutes
  3, // limit each IP to 3 comments per 5 minutes
  'Too many comments, please slow down'
);

// Post creation rate limiter (for authors)
const postLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 posts per hour
  'Too many posts created, please try again later'
);

// File upload rate limiter
const uploadLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // limit each IP to 20 uploads per 15 minutes
  'Too many file uploads, please try again later'
);

// Password reset rate limiter
const passwordResetLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  3, // limit each IP to 3 password reset requests per 15 minutes
  'Too many password reset attempts, please try again later'
);

// Email verification rate limiter
const emailVerificationLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  3, // limit each IP to 3 verification emails per 15 minutes
  'Too many verification emails sent, please try again later'
);

module.exports = {
  generalLimiter,
  authLimiter,
  commentLimiter,
  postLimiter,
  uploadLimiter,
  passwordResetLimiter,
  emailVerificationLimiter
};