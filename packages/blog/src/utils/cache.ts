import ioRedis from 'ioredis';
import { BlogConfigsEntity } from "../modules";
import { TConfigs, PJBLOG_CONFIG_FILENAME } from "./config";
import { createContext } from '@typeservice/process';
import { ClassicCache, FileCache, RedisCache } from "../lib";
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const PJBLOG_CACHE_CONTEXT = createContext<ClassicCache>();

export interface TRedisConfigs {
  host: string,
  port: number,
  password: string,
  db: number
}

export async function createCacheServer(configs: TConfigs, options: BlogConfigsEntity) {
  switch(options.blog_cache_mode) {
    case 'file':
      const dictionary = resolve(process.cwd(), 'cache');
      const filecache = new FileCache(dictionary);
      PJBLOG_CACHE_CONTEXT.setContext(filecache);
      break;
    case 'redis':
      if (!configs.redis) throw new Error('miss redis configs in ' + PJBLOG_CONFIG_FILENAME);
      const redis = new ioRedis(configs.redis);
      await new Promise<void>((resolve, reject) => {
        const onerror = (e: any) => reject(e);
        redis.on('error', onerror);
        redis.on('connect', () => {
          redis.off('error', onerror);
          resolve();
        })
      })
      const rediscache = new RedisCache(redis);
      PJBLOG_CACHE_CONTEXT.setContext(rediscache);
      break;
    default: throw new Error('unknow cache mode!');
  }
}