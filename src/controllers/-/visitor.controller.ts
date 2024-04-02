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

import { Controller, Response } from '@zille/http-controller';
import { Swagger, SwaggerWithGlobal } from '../../lib/swagger/swagger';
import { Schema } from '../../lib/schema/schema.lib';
// import { BlogVariable } from '../../applications/variable.app';
// import { Exception } from '../../lib/exception';
import { NormalErrorCatch } from '../../middlewares/catch.mdw';
import { SessionMiddleware } from '../../middlewares/session.mdw';
import { createSSEMiddleware } from '../../middlewares/sse.mdw';
import { Context } from 'koa';

const res = {
  value: 0
}

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(NormalErrorCatch, SessionMiddleware, createSSEMiddleware())
@Swagger.Definition(SwaggerWithGlobal, path => {
  path
    .summary('SSE')
    .description('SSE')
    .produces('text/event-stream')

  path.addResponse(200, '请求成功').schema(new Schema.String());
})
export default class extends Controller {
  public async main(@Controller.Context(ctx => ctx) ctx: Context) {
    res.value++;
    const timer = setInterval(() => ctx.sse.send(res.value.toString()), 1000).unref();
    const close = () => {
      res.value--;
      clearInterval(timer);
      ctx.sse.end();
    }
    ctx.req.on('close', close);
    ctx.req.on('end', close);
    ctx.status = 200;
    return Response.null();
  }
}
