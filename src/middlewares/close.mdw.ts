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

import { Context, Next } from 'koa';
import { container } from '@zille/application';
import { BlogVariable } from '../applications/variable.app';

export async function BlogCloseMiddleware(ctx: Context, next: Next) {
  const configs = await container.connect(BlogVariable);
  const closeable = configs.get('close');
  if (!closeable) return await next();
  ctx.body = 'Blog closed: ' + configs.get('closeReason');
}