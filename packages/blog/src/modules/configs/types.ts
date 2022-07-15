import { BlogConfigsEntity } from './entity';

export interface TSetBlogConfigsEntityProps {
  readonly blog_name: BlogConfigsEntity['blog_name'],
  readonly blog_description: BlogConfigsEntity['blog_description'],
  readonly blog_close: BlogConfigsEntity['blog_close'],
  readonly blog_cache_mode: BlogConfigsEntity['blog_cache_mode'],
  readonly blog_cache_namespace: BlogConfigsEntity['blog_cache_namespace'],
  readonly blog_login_expires: BlogConfigsEntity['blog_login_expires'],
};
