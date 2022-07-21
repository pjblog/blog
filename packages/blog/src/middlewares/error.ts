import { Context, Next } from 'koa';
import { Exception } from '@typeservice/exception';

export async function ErrorBoundary(ctx: Context, next: Next) {
  if (!ctx.path.startsWith('/api')) return await next();
  try {
    await next();
    ctx.body = {
      status: 200,
      data: ctx.body,
    }
  } catch (e: any) {
    if (e instanceof Exception) {
      ctx.body = {
        status: e.status,
        errors: e.messages,
        error: e.message,
      }
    } else {
      ctx.body = {
        status: 500,
        errors: [e.message],
        error: e.message,
      }
    }
  }
}