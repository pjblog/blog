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

import { Controller, Response } from "@zille/http-controller";
import { Swagger, SwaggerWithPlugin, createApiSchema } from "../../../../lib/swagger/swagger";
import { Schema } from "../../../../lib/schema/schema.lib";
import { JSONErrorCatch } from "../../../../middlewares/catch.mdw";
import { DataBaseMiddleware } from "../../../../middlewares/database.mdw";
import { UserAdminableMiddleware } from "../../../../middlewares/user.mdw";
import { Plugins } from "../../../../applications/plugin.app";
import { Exception } from "../../../../lib/exception";

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithPlugin, path => {
  path
    .summary('获取插件基础信息')
    .description('获取插件基础信息')
    .produces('application/json');

  path.addParameter('name', '插件名').In('path').schema(new Schema.String());
  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Object()
      .set('cwd', new Schema.String())
      .set('code', new Schema.String())
      .set('version', new Schema.String())
      .set('name', new Schema.String())
      .set('description', new Schema.String())
      .set('cover', new Schema.String())
      .set('previews', new Schema.Array().items(new Schema.String()))
      .set('readme', new Schema.String())
  ));
})
export default class extends Controller<'name'> {

  @Controller.Inject(Plugins)
  private readonly plugins: Plugins;

  public async main(@Controller.Param('name') name: string) {
    if (!this.plugins.has(name)) throw new Exception(400, '找不到插件');
    const plugin = this.plugins.get(name);
    return Response.json(plugin.toJSON());
  }
}