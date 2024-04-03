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
import { JSONErrorCatch } from "../../../middlewares/catch.mdw";
import { DataBaseMiddleware } from "../../../middlewares/database.mdw";
import { UserAdminableMiddleware } from "../../../middlewares/user.mdw";
import { Swagger, SwaggerWithAttachment, createApiSchema } from "../../../lib/swagger/swagger";
import { Schema } from "../../../lib/schema/schema.lib";
import { AttachmentSchema } from "../../../schemas/attachment.schema";
import { TransformStringToNumber } from "../../../utils";
import { AttachmentService } from "../../../services/attachment.service";

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(JSONErrorCatch, DataBaseMiddleware(), UserAdminableMiddleware)
@Swagger.Definition(SwaggerWithAttachment, path => {
  path
    .summary('附件列表')
    .description('附件列表')
    .produces('application/json')

  path.addParameter('page', '页码').In('query').required().schema(new Schema.Number(1)).required();
  path.addParameter('size', '分页大小').In('query').required().schema(new Schema.Number(10)).required();
  path.addParameter('type', '类型').In('query').required().schema(new Schema.String()).required();
  path.addParameter('image', '是否是图片').In('query').required().schema(new Schema.Number(0).enum(0, 1)).required();
  path.addResponse(200, '请求成功').schema(createApiSchema(
    new Schema.Array().items(AttachmentSchema)
  ));
})
export class GetAttachmentsController extends Controller {
  @Controller.Inject(AttachmentService)
  private readonly service: AttachmentService;

  public async main(
    @Controller.Query('page', TransformStringToNumber(1)) page: number,
    @Controller.Query('size', TransformStringToNumber(10)) size: number,
    @Controller.Query('type') type: string,
    @Controller.Query('image', TransformStringToNumber(0), Boolean) image: boolean,
  ) {
    const [dataSource, total] = await this.service.getMany(page, size, {
      type,
      image,
    });
    return Response.json(dataSource)
      .set('x-page', page)
      .set('x-size', size)
      .set('x-total', total);
  }
}