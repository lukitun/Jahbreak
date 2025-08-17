import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 60000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    redisClient.on('end', () => {
      console.log('Redis client connection ended');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Session management functions
export const storeSession = async (sessionId: string, data: any, expireInSeconds = 86400): Promise<void> => {
  try {
    await redisClient.setEx(`session:${sessionId}`, expireInSeconds, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing session:', error);
    throw error;
  }
};

export const getSession = async (sessionId: string): Promise<any | null> => {
  try {
    const data = await redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await redisClient.del(`session:${sessionId}`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// User presence management
export const setUserOnline = async (userId: string, socketId: string): Promise<void> => {
  try {
    await redisClient.hSet(`user:${userId}:presence`, {
      status: 'online',
      lastSeen: new Date().toISOString(),
      socketId
    });
    await redisClient.expire(`user:${userId}:presence`, 300); // 5 minutes TTL
  } catch (error) {
    console.error('Error setting user online:', error);
  }
};

export const setUserOffline = async (userId: string): Promise<void> => {
  try {
    await redisClient.hSet(`user:${userId}:presence`, {
      status: 'offline',
      lastSeen: new Date().toISOString()
    });
    await redisClient.expire(`user:${userId}:presence`, 86400); // 24 hours TTL
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

export const getUserPresence = async (userId: string): Promise<any | null> => {
  try {
    const presence = await redisClient.hGetAll(`user:${userId}:presence`);
    return Object.keys(presence).length > 0 ? presence : null;
  } catch (error) {
    console.error('Error getting user presence:', error);
    return null;
  }
};

// Group member caching
export const cacheGroupMembers = async (groupId: string, members: string[]): Promise<void> => {
  try {
    await redisClient.setEx(`group:${groupId}:members`, 3600, JSON.stringify(members)); // 1 hour TTL
  } catch (error) {
    console.error('Error caching group members:', error);
  }
};

export const getCachedGroupMembers = async (groupId: string): Promise<string[] | null> => {
  try {
    const members = await redisClient.get(`group:${groupId}:members`);
    return members ? JSON.parse(members) : null;
  } catch (error) {
    console.error('Error getting cached group members:', error);
    return null;
  }
};