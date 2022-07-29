import { Context, Next } from 'koa';
import { HTTPMiddleware, HTTPMiddlewareImplements } from "@typeservice/http";
import { BlogConfigStorage } from '../modules/configs';
import { PJBLOG_CACHE_CONTEXT } from '../utils';
import { BlogUserStorage } from '../modules/user';
import { HttpForbiddenException } from '@typeservice/exception';

@HTTPMiddleware()
export class BlogUserInfoMiddleware implements HTTPMiddlewareImplements {
  public async use(ctx: Context, next: Next) {
    const cookie = ctx.cookies;
    const cache = PJBLOG_CACHE_CONTEXT.value;
    const configs = await BlogConfigStorage.get();
    const hash = cookie.get(configs.blog_cache_namespace, { signed: true });

    if (hash) {
      const account = await cache.get('/blog/login/hash/' + hash);
      if (account) {
        const user = await BlogUserStorage.get({ account });
        if (user) {
          if (user.forbiden) {
            throw new HttpForbiddenException();
          }
          ctx.state.profile = user;
        }
      }
    }

    await next();
  }
}