import { Context, Next } from 'koa';
import { HTTPMiddleware, HTTPMiddlewareImplements } from "@typeservice/http";
import { HttpUnauthorizedException } from '@typeservice/exception';

@HTTPMiddleware()
export class BlogUserLoginedMiddleware implements HTTPMiddlewareImplements {
  public async use(ctx: Context, next: Next) {
    if (!ctx.state.profile) throw new HttpUnauthorizedException();
    await next();
  }
}
