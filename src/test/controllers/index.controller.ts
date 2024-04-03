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
import { Swagger, createApiSchema } from "../../lib/swagger/swagger";
import { SwaggerWithPlugin1 } from "../group";
import { Schema } from "../../lib/schema/schema.lib";
import { JSONErrorCatch } from "../../middlewares/catch.mdw";

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch)
@Swagger.Definition(SwaggerWithPlugin1, path => {
  path
    .summary('插件 1')
    .description(' 插件 1 获取')
    .produces('application/json')

  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Object()
      .set('label', new Schema.String())
      .set('value', new Schema.Number())
  ));
})
export default class extends Controller {
  public async main() {
    return Response.json({
      label: 'Hello world',
      value: Date.now(),
    })
  }
}