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
import { HttpBodyMiddleware } from "../../../../middlewares/http.body.mdw";

@Controller.Injectable()
@Controller.Method('POST')
@Controller.Middleware(JSONErrorCatch, HttpBodyMiddleware, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithTheme, path => {
  path
    .summary('更新主题配置')
    .description('更新主题配置')
    .produces('application/json');

  path.addParameter('name', '主题名').In('path').schema(new Schema.String());
  path.addParameter('body', '数据').In('body').schema(new Schema.Object());
  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Number()
  ));
})
export class UpdateThemeConfigsController extends Controller<'name'> {
  @Controller.Inject(Themes)
  private readonly themes: Themes;

  @Controller.Inject(Plugins)
  private readonly plugins: Plugins;

  public async main(@Controller.Param('name') name: string, @Controller.Body body: object) {
    if (!this.themes.has(name)) throw new Exception(400, '找不到主题');
    if (!this.plugins.has(name)) throw new Exception(400, '找不到插件');
    const plugin = this.plugins.get(name);
    await plugin.configs.save(body);
    return Response.json(Date.now());
  }
}