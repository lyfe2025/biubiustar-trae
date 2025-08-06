import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { createClient as createRedisClient } from 'redis';

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建Supabase客户端（服务端使用service role key）
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Redis配置
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD;

export const redis = createRedisClient({
  url: redisUrl,
  password: redisPassword || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis连接重试次数过多');
      }
      return Math.min(retries * 50, 1000);
    },
  },
});

// Redis连接事件
redis.on('connect', () => {
  console.log('Redis连接成功');
});

redis.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

redis.on('ready', () => {
  console.log('Redis准备就绪');
});

// 初始化Redis连接
export const initRedis = async () => {
  try {
    await redis.connect();
    console.log('Redis初始化完成');
  } catch (error) {
    console.error('Redis初始化失败:', error);
    // 在开发环境中，Redis连接失败不应该阻止应用启动
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

// 缓存工具函数
export const cache = {
  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setEx(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      console.error('缓存设置失败:', error);
    }
  },

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached.toString()) as T;
      }
      return null;
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  },

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('缓存删除失败:', error);
    }
  },

  // 批量删除缓存
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('批量缓存删除失败:', error);
    }
  },

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('缓存检查失败:', error);
      return false;
    }
  },
};