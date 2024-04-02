import { Context, Next } from "koa";
import { IKoaSSEOptions, KoaSSE } from "../lib/sse.lib";
import { container } from "@zille/application";
import { Logger } from "../applications/logger.app";
// import { Writable } from "node:stream";

declare module 'koa' {
  interface BaseContext {
    sse: KoaSSE,
  }
}

const defaultOptions: IKoaSSEOptions = {
  pingInterval: 60000,
  closeEvent: "close"
}

export const createSSEMiddleware = (options: IKoaSSEOptions = defaultOptions) => {
  const ssePool: KoaSSE[] = [];
  setInterval(() => ssePool.forEach(sse => sse.keepAlive())).unref();
  return async (ctx: Context, next: Next) => {
    const logger = await container.connect(Logger);
    if (ctx.res.headersSent) {
      if (!ctx.sse) {
        logger.error('[koa-sse]: response headers already sent, unable to create sse stream');
      }
      return await next();
    }

    const sse = new KoaSSE(ctx, options);
    ssePool.push(sse);

    const close = async (): Promise<void> => {
      // Remove sse instance from pool
      ssePool.splice(ssePool.indexOf(sse), 1);
      // Release stream resources
      sse.unpipe();
      sse.destroy();
      // End the response
      ctx.res.end();
      ctx.socket.destroy();
    };

    sse.on("close", close);
    sse.on("error", close);

    ctx.sse = sse;

    await next();

    ctx.status = 200;
    ctx.body = ctx.sse;

    // if (!ctx.body) {
    //   // Set response to sse stream if no body
    //   ctx.body = ctx.sse;
    // } else if (ctx.body instanceof Writable) {
    //   // Stream body into sse writable stream exists
    //   ctx.body = ctx.body.pipe(ctx.sse);
    // } else {
    //   // Empty existing body response into sse stream
    //   ctx.sse.send(ctx.body);
    //   ctx.body = sse;
    // }
  }
}