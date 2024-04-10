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
import { NormalErrorCatch } from '../../middlewares/catch.mdw';
import { Session, SessionMiddleware } from '../../middlewares/session.mdw';
import { createSSEMiddleware } from '../../middlewares/sse.mdw';
import { Context } from 'koa';
import { Online } from '../../applications/online.app';
import { Me, UserLoginInfoMiddleware } from '../../middlewares/user.mdw';
import { BlogUserEntity } from '../../entities/user.entity';

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(NormalErrorCatch, SessionMiddleware, UserLoginInfoMiddleware, createSSEMiddleware())
@Swagger.Definition(SwaggerWithGlobal, path => {
  path
    .summary('SSE')
    .description('SSE')
    .produces('text/event-stream')

  path.addResponse(200, '请求成功').schema(new Schema.String());
})
export default class extends Controller {
  @Controller.Inject(Online)
  private readonly Online: Online;

  public async main(
    @Session token: string,
    @Me me: BlogUserEntity,
  ) {
    const res = Response.sse(200);
    const handler = () => res.emit('sse', 'online', {
      size: this.Online.size,
      list: this.Online.list,
    })
    res.on('close', () => {
      if (me?.account) {
        this.Online.del('user:' + me.account);
      } else {
        this.Online.del('token:' + token);
      }
      this.Online.event.off('change', handler);
    })

    if (me?.account) {
      this.Online.del('token:' + token);
      this.Online.add('user:' + me.account);
    } else {
      this.Online.add('token:' + token);
    }

    this.Online.event.on('change', handler);

    handler();

    return res;
  }
}
