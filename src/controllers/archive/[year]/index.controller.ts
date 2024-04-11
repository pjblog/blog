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

import { Controller, Newable, Response } from '@zille/http-controller';
import { NormalErrorCatch } from '../../../middlewares/catch.mdw';
import { Swagger, SwaggerWithWebPage, createApiSchema } from '../../../lib/swagger/swagger';
import { Schema } from '../../../lib/schema/schema.lib';
import { Themes } from '../../../applications/theme.app';
import { TransformStringToNumber, createMeValue } from '../../../utils';
import { DataBaseMiddleware } from '../../../middlewares/database.mdw';
import { Exception } from '../../../lib/exception';
import { ArchivePage } from '../../../lib/theme/archive.lib';
import { Me, UserLoginInfoMiddleware } from '../../../middlewares/user.mdw';
import { BlogUserEntity } from '../../../entities/user.entity';
import { Context } from '@zille/core';
import { SessionMiddleware } from '../../../middlewares/session.mdw';
import { BlogCloseMiddleware } from '../../../middlewares/close.mdw';

@Controller.Injectable()
@Controller.Method('GET')
@Controller.Middleware(
  NormalErrorCatch,
  BlogCloseMiddleware,
  DataBaseMiddleware(),
  UserLoginInfoMiddleware,
  SessionMiddleware,
)
@Swagger.Definition(SwaggerWithWebPage, path => {
  path
    .summary('归档 - 年')
    .description('主题 - 归档 - 年')
    .produces('application/json')

  path.addResponse(200, '请求成功').schema(createApiSchema(new Schema.String()));
})
export default class extends Controller<'year'> {
  @Controller.Inject(Themes)
  private readonly themes: Themes;

  public async main(
    @Me me: BlogUserEntity,
    @Controller.Context(ctx => ctx.url) url: string,
    @Controller.Store context: Context,
    @Controller.Query('page', TransformStringToNumber(1)) page: number,
    @Controller.Query('type') type: string,
    @Controller.Query('category', TransformStringToNumber(0)) category: number,
    @Controller.Param('year', Number) year: number,
  ) {
    const Theme = this.themes.current;
    if (!Theme.has('archive')) throw new Exception(400, '缺少主题文件');
    context.addCache('me', createMeValue(me));
    const theme = await this.$use(Theme.get('archive') as Newable<ArchivePage>);
    const state = await Promise.resolve(theme.state({ page, url, year, type, category }, context));
    return new Response()
      .setData(await Promise.resolve(theme.render(state)))
      .setType('.html')
      .setStatus(200);
  }
}
