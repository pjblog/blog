export interface ClassicCache {
  set<T = any>(key: string, value: T, seconds?: number): Promise<T>;
  get<T = any>(key: string): Promise<T>;
  del(key: string): Promise<boolean>;
  expire(key: string, ms: number): Promise<boolean>;
}