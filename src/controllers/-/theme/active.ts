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
import { BlogVariable } from "../../../applications/variable.app";
import { Exception } from "../../../lib/exception";

@Controller.Injectable()
@Controller.Method('POST')
@Controller.Middleware(JSONErrorCatch, HttpBodyMiddleware, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithTheme, path => {
  path
    .summary('启用主题')
    .description('启用主题')
    .produces('application/json');

  path.addParameter('value', '主题名').In('formData').schema(new Schema.String());
  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Number()
  ));
})
export class ThemeActiveController extends Controller {
  @Controller.Inject(BlogVariable)
  private readonly configs: BlogVariable;

  @Controller.Inject(Themes)
  private readonly themes: Themes;

  public async main(@Controller.Body body: {
    value: string,
  }) {
    if (!this.themes.has(body.value)) throw new Exception(400, '主题不存在')
    await this.configs.update('theme', body.value);
    return Response.json(Date.now());
  }
}