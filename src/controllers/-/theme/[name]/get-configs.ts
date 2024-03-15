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
import { Swagger, SwaggerWithTheme, createApiSchema } from "../../../../lib/swagger/swagger";
import { Schema } from "../../../../lib/schema/schema.lib";
import { JSONErrorCatch } from "../../../../middlewares/catch.mdw";
import { DataBaseMiddleware } from "../../../../middlewares/database.mdw";
import { UserAdminableMiddleware } from "../../../../middlewares/user.mdw";
import { Themes } from "../../../../applications/theme.app";
import { Plugins } from "../../../../applications/plugin.app";
import { Exception } from "../../../../lib/exception";

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithTheme, path => {
  path
    .summary('获取主题配置')
    .description('获取主题配置')
    .produces('application/json');

  path.addParameter('name', '主题名').In('path').schema(new Schema.String());
  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Object()
      .set('value', new Schema.Object())
      .set('schema', new Schema.Object())
  ));
})
export class GetThemeConfigsController extends Controller<'name'> {
  @Controller.Inject(Themes)
  private readonly themes: Themes;

  @Controller.Inject(Plugins)
  private readonly plugins: Plugins;

  public async main(@Controller.Param('name') name: string) {
    if (!this.themes.has(name)) throw new Exception(400, '找不到主题');
    if (!this.plugins.has(name)) throw new Exception(400, '找不到插件');
    const plugin = this.plugins.get(name);
    return Response.json({
      value: plugin.configs.toJSON(),
      schema: plugin.configs.toSchema(),
    });
  }
}