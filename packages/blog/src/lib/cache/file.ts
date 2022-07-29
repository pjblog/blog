import { ClassicCache } from './types';
import { resolve, dirname } from 'path';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { ensureDir } from 'fs-extra';

interface TFileState<T> {
  value: T,
  expire?: number,
}

export class FileCache implements ClassicCache {
  constructor(private readonly dictionary: string) {}

  private createFilePathWithKey(key: string) {
    const filename = key.startsWith('/') ? '.' + key : key;
    return resolve(this.dictionary, filename + '.json');
  }

  public async set<T = any>(key: string, value: T, seconds?: number): Promise<T> {
    const filepath = this.createFilePathWithKey(key);
    const dir = dirname(filepath);
    await ensureDir(dir);
    writeFileSync(filepath, JSON.stringify({ value }), 'utf8');
    if (seconds) await this.expire(key, seconds);
    if (require.cache[filepath]) {
      delete require.cache[filepath];
    }
    return value;
  }

  public async get<T = any>(key: string): Promise<T> {
    const filepath = this.createFilePathWithKey(key);
    if (!existsSync(filepath)) return;
    const source = require(filepath) as TFileState<T>;
    if (source.expire && Date.now() > source.expire) {
      this.del(key);
      return;
    }
    return source.value;
  }

  public async del(key: string): Promise<boolean> {
    const filepath = this.createFilePathWithKey(key);
    if (!existsSync(filepath)) return true;
    unlinkSync(filepath);
    // 清除require缓存
    if (require.cache[filepath]) {
      delete require.cache[filepath];
    }
    return true;
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    const filepath = this.createFilePathWithKey(key);
    const value = await this.get(key);
    if (!value) return false;
    writeFileSync(filepath, JSON.stringify({ value, expire: Date.now() + seconds * 1000 }), 'utf8');
    if (require.cache[filepath]) {
      delete require.cache[filepath];
    }
    return true;
  }
}