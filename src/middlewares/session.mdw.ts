import pkg from 'crypto-js';
import { Context, Next } from "koa";
import { container } from '@zille/application';
import { BlogVariable } from '../applications/variable.app';
import { Controller } from '@zille/http-controller';
const { MD5 } = pkg;

declare module 'koa' {
  interface BaseContext {
    session: string,
  }
}

export const Session = Controller.Context(ctx => ctx.session);
export async function SessionMiddleware(ctx: Context, next: Next) {
  const key = ctx.cookies.get('session', { signed: true });
  const finger = ctx.headers['x-finger'] as string;
  const token = finger || key || MD5(Date.now().toString()).toString();

  const configs = await container.connect(BlogVariable);
  const maxAgeSec = configs.get('sessionMaxAge') * 24 * 60 * 60;
  const domain = new URL(configs.get('domain'));

  ctx.session = token;

  await next();

  ctx.cookies.set('session', token, {
    expires: new Date(Date.now() + maxAgeSec * 1000),
    signed: true,
    path: '/',
    httpOnly: true,
    domain: '.' + domain.hostname,
  })
}