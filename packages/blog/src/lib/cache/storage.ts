import { Container } from '@typeservice/http';
import { PJBLOG_CACHE_CONTEXT, container } from '../../utils';
import { compile } from 'path-to-regexp';

export type TStorageFeedback<I extends Record<string, any> = any, R = any> = (options: I, container?: Container) => Promise<{ result: R, expire?: number }>;
export function createStorage<I extends Record<string, any> = any, R = any>(key: string, callback: TStorageFeedback<I, R>) {
  const toPath = compile(key, { encode: encodeURIComponent });

  const defineSetter = async (options?: I) => {
    const cache = PJBLOG_CACHE_CONTEXT.value;
    const path = toPath(options);
    const res = await callback(options, container);
    return await cache.set(path, res.result, res.expire);
  }

  const defineGetter = async (options?: I) => {
    const cache = PJBLOG_CACHE_CONTEXT.value;
    const path = toPath(options);
    const value = await cache.get<R>(path);
    if (value === undefined) return await defineSetter(options);
    return value;
  }

  return {
    get: defineGetter,
    set: defineSetter,
  }
}