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
import { Swagger, SwaggerWithGlobal, createApiSchema } from '../../../lib/swagger/swagger';
import { Schema } from '../../../lib/schema/schema.lib';
import { JSONErrorCatch } from '../../../middlewares/catch.mdw';
import { DataBaseMiddleware } from '../../../middlewares/database.mdw';
import { UserAdminableMiddleware } from '../../../middlewares/user.mdw';
import { MediaService } from '../../../services/media.service';

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithGlobal, path => {
  path
    .summary('获取媒体数')
    .description('获取媒体数')
    .produces('application/json')

  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Object()
      .set('total', new Schema.Number())
      .set('articles', new Schema.Number())
      .set('pages', new Schema.Number())
  ));
})
export default class extends Controller {
  @Controller.Inject(MediaService)
  private readonly service: MediaService;
  public async main() {
    const total = await this.service.total();
    const articles = await this.service.total('article');
    const pages = await this.service.total('page');
    return Response.json({
      total,
      articles,
      pages,
    });
  }
}
