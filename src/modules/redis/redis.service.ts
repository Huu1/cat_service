import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly ONLINE_USERS_KEY = 'online_users';
  private readonly TODAY_ACTIVE_USERS_KEY = 'today_active_users';
  private readonly TODAY_RECORDS_COUNT_KEY = 'today_records_count';
  private readonly ONLINE_TIMEOUT = 300; // 5分钟无活动视为离线

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD', ''),
      db: this.configService.get('REDIS_DB', 0),
    });
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  // 更新用户活跃状态
  async updateUserActivity(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // 更新在线用户
    await this.redis.setex(`${this.ONLINE_USERS_KEY}:${userId}`, this.ONLINE_TIMEOUT, Date.now().toString());
    
    // 更新今日活跃用户
    await this.redis.sadd(`${this.TODAY_ACTIVE_USERS_KEY}:${today}`, userId);
    // 设置今日活跃用户集合的过期时间（48小时后过期）
    await this.redis.expire(`${this.TODAY_ACTIVE_USERS_KEY}:${today}`, 48 * 60 * 60);
  }

  // 记录用户记账行为
  async recordUserBookkeeping(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // 更新用户活跃状态
    await this.updateUserActivity(userId);
    
    // 增加今日记账计数
    await this.redis.incr(`${this.TODAY_RECORDS_COUNT_KEY}:${today}`);
    // 设置过期时间
    await this.redis.expire(`${this.TODAY_RECORDS_COUNT_KEY}:${today}`, 48 * 60 * 60);
  }

  // 获取当前在线用户数
  async getOnlineUsersCount(): Promise<number> {
    const keys = await this.redis.keys(`${this.ONLINE_USERS_KEY}:*`);
    return keys.length;
  }

  // 获取今日活跃用户数
  async getTodayActiveUsersCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    return this.redis.scard(`${this.TODAY_ACTIVE_USERS_KEY}:${today}`);
  }

  // 获取今日记账总数
  async getTodayRecordsCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const count = await this.redis.get(`${this.TODAY_RECORDS_COUNT_KEY}:${today}`);
    return count ? parseInt(count) : 0;
  }
}