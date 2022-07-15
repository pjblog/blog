import { Context, Next } from 'koa';
import { HTTPMiddleware, HTTPMiddlewareImplements } from "@typeservice/http";
import { BlogConfigStorage } from '../../configs/store';
import { PJBLOG_CACHE_CONTEXT } from '../../../utils';
import { HttpUnauthorizedException } from '@typeservice/exception';
import { BlogUserStorage } from '../store';

@HTTPMiddleware()
export class BlogUserLoginedMiddleware implements HTTPMiddlewareImplements {
  public async use(ctx: Context, next: Next) {
    const cookie = ctx.cookies;
    const cache = PJBLOG_CACHE_CONTEXT.value;
    const configs = await BlogConfigStorage.get();
    const hash = cookie.get(configs.blog_cache_namespace, { signed: true });
    if (!hash) throw new HttpUnauthorizedException();
    const account = await cache.get('/blog/login/hash/' + hash);
    if (!account) throw new HttpUnauthorizedException();
    const user = await BlogUserStorage.get({ account });
    if (!user) throw new HttpUnauthorizedException();
    ctx.state.profile = user;
    await next();
  }
}
