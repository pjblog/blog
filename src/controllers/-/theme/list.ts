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
import { Swagger, SwaggerWithTheme, createApiSchema } from "../../../lib/swagger/swagger";
import { Schema } from "../../../lib/schema/schema.lib";
import { JSONErrorCatch } from "../../../middlewares/catch.mdw";
import { HttpBodyMiddleware } from "../../../middlewares/http.body.mdw";
import { DataBaseMiddleware } from "../../../middlewares/database.mdw";
import { UserAdminableMiddleware } from "../../../middlewares/user.mdw";
import { Themes } from "../../../applications/theme.app";
import { Plugins } from "../../../applications/plugin.app";
import { BlogVariable } from "../../../applications/variable.app";

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithTheme, path => {
  path
    .summary('主题列表')
    .description('主题列表')
    .produces('application/json');

  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Object()
      .set('current', new Schema.String())
      .set('themes', new Schema.Array().items(
        new Schema.Object()
          .set('cwd', new Schema.String())
          .set('code', new Schema.String())
          .set('version', new Schema.String())
          .set('name', new Schema.String())
          .set('description', new Schema.String())
          .set('cover', new Schema.String())
          .set('previews', new Schema.Array().items(new Schema.String()))
          .set('readme', new Schema.String())
      ))
  ));
})
export class ThemeListController extends Controller {
  @Controller.Inject(BlogVariable)
  private readonly configs: BlogVariable;

  @Controller.Inject(Themes)
  private readonly themes: Themes;

  @Controller.Inject(Plugins)
  private readonly plugins: Plugins;

  public async main() {
    const current = this.configs.get('theme');
    const names = this.themes.getAllNames();
    const plugins = this.plugins.toArray();
    return Response.json({
      current,
      themes: plugins.filter(plugin => names.includes(plugin.name)),
    });
  }
}