import { Redis } from 'ioredis';
import { ClassicCache } from './types';
export class RedisCache implements ClassicCache {
  constructor(private readonly redis: Redis) {}

  public async set<T = any>(key: string, value: T, seconds?: number): Promise<T> {
    const buf = JSON.stringify(value);
    if (seconds) {
      await this.redis.setex(key, seconds, buf);
    } else {
      await this.redis.set(key, buf);
    }
    return value;
  }

  public async get<T = any>(key: string): Promise<T> {
    if (!(await this.redis.exists(key))) return;
    return JSON.parse(await this.redis.get(key));
  }

  public async del(key: string): Promise<boolean> {
    if (!(await this.redis.exists(key))) return true;
    return !!(await this.redis.del(key));
  }

  public async expire(key: string, ms: number): Promise<boolean> {
    if (!(await this.redis.exists(key))) return false;
    return !!(await this.redis.expire(key, ms));
  }
}