import { sync } from '@stdlib/fs-resolve-parent-path';
import type { TORMConfigs } from './orm';
import type { TRedisConfigs } from './cache';
export const PJBLOG_CONFIG_FILENAME = 'pjblog.config.json';

export interface TConfigs {
  orm: TORMConfigs,
  redis?: TRedisConfigs,
  port: number,
}

export function loadConfigs(): TConfigs {
  const filepath = sync(PJBLOG_CONFIG_FILENAME, { dir: process.cwd() });
  if (!filepath) throw new Error('cannot find the ' + PJBLOG_CONFIG_FILENAME);
  return require(filepath);
}