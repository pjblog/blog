/**
 * Copyright (c) PJBlog Platforms, net. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @Author evio<evio@vip.qq.com>
 * @Website https://www.pjhome.net
 */

'use strict';

import pkg from 'crypto-js';
import { Context, Next } from "koa";
import { container } from '@zille/application';
import { BlogVariable } from '../applications/variable.app';
import { Controller } from '@zille/http-controller';
import { Online } from '../applications/online.app';
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

  const online = await container.connect(Online);
  online.addVisitor(token, ctx.ip, ctx.headers['user-agent'], ctx.user?.account);

  await next();

  ctx.cookies.set('session', token, {
    expires: new Date(Date.now() + maxAgeSec * 1000),
    signed: true,
    path: '/',
    httpOnly: true,
    domain: '.' + domain.hostname,
  })
}