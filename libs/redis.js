import Redis from 'ioredis';

// Initialize Redis client
let redis;

try {
  // Create Redis client using the URL from environment variables
  redis = new Redis(process.env.REDIS_URL, {
    // Enable TLS if using rediss:// protocol
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    // Retry strategy for reconnection
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // Maximum number of reconnection attempts
    maxRetriesPerRequest: 3,
  });

  // Log successful connection
  redis.on('connect', () => {
    console.log('Redis client connected');
  });

  // Log errors
  redis.on('error', (err) => {
    console.error('Redis client error:', err);
  });
} catch (error) {
  console.error('Redis initialization error:', error);
  // Create a mock Redis client for fallback
  redis = {
    get: async () => null,
    set: async () => false,
    del: async () => false,
  };
}

/**
 * Get cached data from Redis
 * @param {string} key - The cache key
 * @returns {Promise<any>} - The cached data or null if not found
 */
export async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set data in Redis cache with expiration
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 * @param {number} expireSeconds - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<boolean>} - True if successful
 */
export async function setCache(key, data, expireSeconds = 3600) {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Set with expiration
    if (expireSeconds > 0) {
      await redis.set(key, jsonData, 'EX', expireSeconds);
    } else {
      await redis.set(key, jsonData);
    }
    
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

/**
 * Delete a key from Redis cache
 * @param {string} key - The cache key to delete
 * @returns {Promise<boolean>} - True if successful
 */
export async function deleteCache(key) {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

export default redis; 