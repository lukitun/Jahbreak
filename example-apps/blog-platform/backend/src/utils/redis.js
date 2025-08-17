const { createClient } = require('redis');
const logger = require('./logger');

let redisClient;

const initRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.warn('Redis URL not provided, caching will be disabled');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis retry attempts exhausted');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client disconnected');
    });

    await redisClient.connect();
    logger.info('Redis connection established');
    
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const cache = {
  async get(key) {
    if (!redisClient) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    if (!redisClient) return false;
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key) {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  },

  async delPattern(pattern) {
    if (!redisClient) return false;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis DEL pattern error:', error);
      return false;
    }
  },

  async exists(key) {
    if (!redisClient) return false;
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async incr(key, ttl = 3600) {
    if (!redisClient) return 1;
    try {
      const value = await redisClient.incr(key);
      if (value === 1) {
        await redisClient.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return 1;
    }
  }
};

// Cache key generators
const cacheKeys = {
  post: (slug) => `post:${slug}`,
  postList: (page, limit, filters) => `posts:${page}:${limit}:${JSON.stringify(filters)}`,
  user: (id) => `user:${id}`,
  category: (id) => `category:${id}`,
  categories: () => 'categories:all',
  comments: (postId, page) => `comments:${postId}:${page}`,
  sitemap: () => 'sitemap',
  popularPosts: () => 'posts:popular',
  recentPosts: () => 'posts:recent'
};

module.exports = {
  initRedis,
  getRedisClient,
  cache,
  cacheKeys
};