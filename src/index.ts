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

// imports
import exitHook from 'async-exit-hook';
import Desktop from '@pjblog/desktop';
import { BlogProps } from './global.types';
import { Application, container } from '@zille/application';
import { Configurator } from '@zille/configurator';
import { TypeORM } from '@zille/typeorm';
import { Http, HttpMiddlewares } from '@zille/http';
import { IORedis } from '@zille/ioredis';
import { LoadControllers, Newable } from '@zille/http-controller';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

import { BlogUserEntity } from './entities/user.entity';
import { BlogCategoryEntity } from './entities/category.entity';
import { BlogMediaEntity } from './entities/media.entity';
import { BlogMediaArticleEntity } from './entities/media.article.entity';
import { BlogMediaTagEntity } from './entities/media.tag.entity';
import { BlogAttachmentEntity } from './entities/attachment.entity';
import { BlogMediaCommentEntity } from './entities/media.comment.entity';
import { BlogVisitorEntity } from './entities/visitor.entity';

import { DataBase } from './applications/database.app';
import { Logger } from './applications/logger.app';
import { Plugin } from './lib/plugin.lib';
import { Storage } from './applications/cache/cache.app';
import { BlogVariable } from './applications/variable.app';
import { Plugins } from './applications/plugin.app';
import { MediaReadCounter } from './applications/readcount.app';
import { Online } from './applications/online.app';

// exports
export * from './applications/database.app';
export * from './applications/env.app';
export * from './applications/logger.app';
export * from './applications/cache/cache.app';
export * from './applications/logins.app';
export * from './applications/media.app';
export * from './applications/theme.app';
export * from './applications/variable.app';
export * from './applications/readcount.app';
export * from './applications/online.app';

export * from './entities/attachment.entity';
export * from './entities/category.entity';
export * from './entities/media.article.entity';
export * from './entities/media.comment.entity';
export * from './entities/media.entity';
export * from './entities/media.tag.entity';
export * from './entities/user.entity';
export * from './entities/visitor.entity';

export * from './middlewares/catch.mdw';
export * from './middlewares/database.mdw';
export * from './middlewares/http.body.mdw';
export * from './middlewares/media.mdw';
export * from './middlewares/user.mdw';
export * from './middlewares/session.mdw';
export * from './middlewares/close.mdw';

export * from './lib/plugin.lib';
export * from './lib/cache.lib';
export * from './lib/schema/schema.lib';
export * from './lib/exception';
export * from './lib/swagger/swagger.lib';
export * from './lib/variable.lib';
export * from './lib/theme/home.lib';
export * from './lib/theme/detail.lib';
export * from './lib/theme/archive.lib';

export * from './caches/attachment.cache';
export * from './caches/category.cache';
export * from './caches/user.cache';

export * from './schemas/attachment.schema';
export * from './schemas/category.schema';
export * from './schemas/comment.schema';
export * from './schemas/media.schema';
export * from './schemas/system.configs.schema';
export * from './schemas/user.schema';

export * from './services/attachment.service';
export * from './services/category.service';
export * from './services/media.article.service';
export * from './services/media.comment.service';
export * from './services/media.service';
export * from './services/media.tag.service';
export * from './services/user.service';

export * from './utils';
export * from './global.types';

// main code
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const controllers = resolve(__dirname, 'controllers');
const require = createRequire(import.meta.url);
const pkg = require(resolve(__dirname, '../package.json'));

export const version: string = pkg.version;
export const description: string = pkg.description;

@Application.Injectable()
class Blog extends Application {

  @Application.Inject(Configurator)
  private readonly Configs: Configurator;

  @Application.Inject(DataBase)
  private readonly DataBase: DataBase;

  @Application.Inject(Logger)
  private readonly Logger: Logger;

  @Application.Inject(HttpMiddlewares)
  private readonly Middlewares: HttpMiddlewares;

  @Application.Inject(Plugins)
  private readonly plugins: Plugins;

  public async initialize(options: BlogProps, plugins: Newable<Plugin>[]) {
    // 插件安装
    const directories = new Map<string, string>();
    const _plugins: Plugin[] = [];
    for (let i = 0; i < plugins.length; i++) {
      const plugin = await this.$use(plugins[i]);
      _plugins.push(plugin);
      if (plugin.cwd && existsSync(plugin.cwd)) {
        const controller = resolve(plugin.cwd, 'controllers');
        if (existsSync(controller)) {
          directories.set(plugin.code, controller);
        }
      }
    }

    // Redis插件启动
    this.Configs.set(Storage.namespace, options.cache);
    this.Configs.set(IORedis.namespace, options.redis);
    await this.$use(Storage);

    // 数据库插件启动
    this.Configs.set(TypeORM.namespace, {
      ...options.database,
      entities: [
        BlogUserEntity,
        BlogCategoryEntity,
        BlogMediaEntity,
        BlogMediaArticleEntity,
        BlogMediaTagEntity,
        BlogAttachmentEntity,
        BlogMediaCommentEntity,
        BlogVisitorEntity,
        ...Array.from(this.DataBase.entities.values()),
      ],
      synchronize: true,
      logging: false,
    });
    await this.$use(TypeORM);

    // 全局变量
    await this.$use(BlogVariable);

    // 文章计数器
    await this.$use(MediaReadCounter);

    // 在线计数器
    await this.$use(Online);

    // 后台管理系统中间件
    this.Middlewares.add('prefix', Desktop);

    // 高级插件静态文件中间件
    this.Middlewares.add('suffix', this.plugins.createAdvanceServeStaticMiddleware());

    // Http 服务启动
    this.Configs.set(Http.namespace, options.http);
    const http = await this.$use(Http);
    this.Logger.http('http://127.0.0.1:' + options.http.port);
    await LoadControllers(controllers, http.app);
    this.Logger.debug(`+ System controllers -> \`${controllers}\``);
    for (const [code, directory] of directories.entries()) {
      await LoadControllers(directory, http.app, {
        prefix: '/-/plugin/' + code + '/api',
      })
      this.Logger.debug(`+ Plugin controllers -> \`${directory}\``);
    }

    // 插件初始化
    for (let i = 0; i < _plugins.length; i++) {
      const plugin = _plugins[i];
      await plugin.initConfigs();
      const rollback = await Promise.resolve(plugin.initialize());
      if (typeof rollback === 'function') {
        plugin.uninstall = rollback;
      }
      this.plugins.add(plugin.name, plugin);
    }

    this.Logger.info('PJBlog server started.');
  }

  public setup() { }
}

// 博客程序启动函数
export default (options: BlogProps, plugins: Newable<Plugin>[] = []) => {
  container.connect(Blog).then(blog => {
    exitHook(exit => container.destroy(Blog).finally(exit));
    return blog.initialize(options, plugins);
  }).catch(e => {
    console.error(e);
    container.destroy(Blog).finally(() => process.exit(1));
  });
}