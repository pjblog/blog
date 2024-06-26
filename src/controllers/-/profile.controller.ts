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
import { Swagger, SwaggerWithGlobal, createApiSchema } from '../../lib/swagger/swagger';
import { Schema } from '../../lib/schema/schema.lib';
import { JSONErrorCatch } from '../../middlewares/catch.mdw';
import { DataBaseMiddleware } from '../../middlewares/database.mdw';
import { Me, UserHasLoginMiddleware } from '../../middlewares/user.mdw';
import { BlogUserEntity } from '../../entities/user.entity';

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch, DataBaseMiddleware(), UserHasLoginMiddleware)
@Swagger.Definition(SwaggerWithGlobal, path => {
  path
    .summary('获取当前登录用户信息')
    .description('获取当前登录用户信息')
    .produces('application/json')

  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Object()
      .description('当前用户信息')
      .set('account', new Schema.String().description('账号').required())
      .set('nickname', new Schema.String().description('昵称').required())
      .set('email', new Schema.String().description('邮箱').required())
      .set('avatar', new Schema.String().description('头像').required())
      .set('admin', new Schema.Bool().description('是否管理员').required())
      .set('website', new Schema.String().description('个人网站').required())
      .set('forbiden', new Schema.Bool().description('是否禁止登录').required())
  ));
})
export default class extends Controller {
  public async main(@Me user: BlogUserEntity) {
    return Response.json({
      account: user.account,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      admin: user.admin,
      website: user.website,
      forbiden: user.forbiden,
    });
  }
}
