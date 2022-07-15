import * as bodyParser from 'koa-bodyparser';
import { createProcess } from '@typeservice/process';
import { createHTTPServer, CONTEXT_HTTP_APPLICATION } from '@typeservice/http';
import { 
  logger, 
  loadConfigs, 
  createORMServer, 
  createCacheServer, 
  container,
  withErrorBoundary
} from './utils';
import { 
  BlogUserEntity,
  HttpBlogUser,
  BlogConfigsEntity,
  HttpBlogConfigs,
  BlogConfigsService,
} from './modules';

const info = require('../package.json');
const loadServices = [
  HttpBlogUser,
  HttpBlogConfigs,
]

export const entities = [
  BlogUserEntity,
  BlogConfigsEntity,
]

export function mount() {
  const configs = loadConfigs();
  const [bootstrap, lifecycle] = createProcess(e => logger.error(e));

  container.bind(BlogConfigsService).toSelf().inSingletonScope();

  // 启动ORM数据库
  lifecycle.createServer(createORMServer({
    synchronize: true,
    entities,
    configs: configs.orm,
  }))

  // 启动缓存容器模式
  lifecycle.createServer(async () => {
    const service = container.get(BlogConfigsService);
    const options = await service.getConfigs();
    if (!options) throw new Error(
        'You must install blog first using `pjblog install`, '
      + 'because system cannot find any configs in db!'
    );
    await createCacheServer(configs, options);
    logger.info('-', '[Plugin]', 'Cache container started!', options.blog_cache_mode);
  })

  // 启动HTTP服务
  lifecycle.createServer(createHTTPServer({
    container,
    port: configs.port,
    services: loadServices,
    middlewares: [withErrorBoundary, bodyParser()],
    bootstrap(port) {
      CONTEXT_HTTP_APPLICATION.value.keys = ['pjblog', 'cookie'];
      logger.info('-', '[Server]', 'Blog start on port', port)
    }
  }));

  bootstrap();
}

export * from './utils';
export * from './modules';
export * from './lib';
export {
  info
}