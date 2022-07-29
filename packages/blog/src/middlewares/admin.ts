import { Context, Next } from 'koa';
import { HTTPMiddleware, HTTPMiddlewareImplements } from "@typeservice/http";
import { HttpForbiddenException } from '@typeservice/exception';
import { BlogUserEntity } from '../modules/user/entity';

@HTTPMiddleware()
export class BlogUserLoginedWithAdminMiddleware implements HTTPMiddlewareImplements {
  public async use(ctx: Context, next: Next) {
    const profile = ctx.state.profile as BlogUserEntity;
    if (profile.level !== 0) throw new HttpForbiddenException();
    await next();
  }
}
