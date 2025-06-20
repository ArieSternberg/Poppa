import type { RedisClientType, createClient as createRedisClient } from 'redis';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

interface UserProfile {
  phone?: string;
  id?: string;
  [key: string]: unknown;
}

interface UserInfo {
  profile?: UserProfile;
  whatsapp_id?: string;
  [key: string]: unknown;
}

interface RedisKey {
  thread_id?: string;
  metadata?: {
    user?: UserInfo;
    [key: string]: unknown;
  };
}

export class RedisMemory {
  private client: RedisClientType;
  private ttl = 60 * 60 * 24; // 24 hours

  constructor() {
    if (typeof window !== 'undefined') {
      throw new Error('RedisMemory can only be instantiated on the server side');
    }
    const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
    // We need to use dynamic import for redis
    import('redis').then(redis => {
      this.client = redis.createClient({ url: REDIS_URL });
    });
  }

  async getConnection() {
    if (!this.client) {
      const redis = await import('redis');
      const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
      this.client = redis.createClient({ url: REDIS_URL });
    }
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    return this.client;
  }

  private _get_user_key(key: RedisKey): string {
    // If the thread_id is already a Redis key format, return it
    if (key.thread_id?.startsWith('chat:')) {
      return key.thread_id;
    }

    const metadata = key.metadata || {};
    const userInfo = metadata.user || {};
    const profile = userInfo.profile || {};

    // Try to get user identifier in order of preference
    const phone = profile.phone;
    const userId = profile.id;
    const whatsappId = userInfo.whatsapp_id;
    const sessionId = key.thread_id || 'default';

    // Return the most specific key available
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      return `chat:phone:${cleanPhone}`;
    } else if (userId) {
      return `chat:user:${userId}`;
    } else if (whatsappId) {
      return `chat:whatsapp:${whatsappId}`;
    } else {
      return `chat:session:${sessionId}`;
    }
  }

  async save(key: RedisKey, messages: Message[]): Promise<void> {
    const client = await this.getConnection();
    const redisKey = this._get_user_key(key);

    try {
      // Convert messages to simple format for storage
      const messageData = messages.map(msg => JSON.stringify({
        role: msg.role,
        content: msg.content
      }));

      // Use pipeline for atomic operation
      const pipeline = client.multi();
      pipeline.rPush(redisKey, messageData);
      pipeline.expire(redisKey, this.ttl);
      await pipeline.exec();

      console.log(`Successfully saved ${messages.length} messages to ${redisKey}`);
    } catch (error) {
      console.error('Error saving to Redis:', error);
      throw error;
    }
  }

  async load(key: RedisKey, limit: number = 10): Promise<Message[]> {
    const client = await this.getConnection();
    const redisKey = this._get_user_key(key);

    try {
      // Get last n messages
      const messages = await client.lRange(redisKey, -limit, -1);
      console.log(`Found ${messages.length} messages in Redis for key ${redisKey}`);

      // Convert to Message objects
      return messages.map((msg: string) => {
        const data = JSON.parse(msg);
        return {
          role: data.role,
          content: data.content
        };
      });
    } catch (error) {
      console.error('Error loading from Redis:', error);
      return [];
    }
  }

  async clear(key: RedisKey): Promise<void> {
    const client = await this.getConnection();
    const redisKey = this._get_user_key(key);
    await client.del(redisKey);
  }
} 