import { Context, Next } from 'koa';
import { HTTPMiddleware, HTTPMiddlewareImplements } from "@typeservice/http";
import { HttpUnauthorizedException, HttpNotAcceptableException } from '@typeservice/exception';
import { BlogUserEntity } from '../entity';

@HTTPMiddleware()
export class BlogUserLoginedWithAdminMiddleware implements HTTPMiddlewareImplements {
  public async use(ctx: Context, next: Next) {
    const profile = ctx.state.profile as BlogUserEntity;
    if (!profile) throw new HttpUnauthorizedException();
    if (profile.level !== 0) throw new HttpNotAcceptableException();
    await next();
  }
}
