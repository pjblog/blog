import { inject } from 'inversify';
import { HTTPController, HTTPRequestBody, HTTPRouter, HTTPRouterMiddleware } from '@typeservice/http';
import { BlogConfigsService } from './service';
import { BlogConfigStorage } from './store';
import { TSetBlogConfigsEntityProps } from './types';
import { BlogUserLoginedMiddleware, BlogUserLoginedWithAdminMiddleware } from '../user/middleware';

@HTTPController()
export class HttpBlogConfigs {
  @inject(BlogConfigsService) private readonly service: BlogConfigsService;
  @HTTPRouter({
    pathname: '/api/configs',
    methods: 'GET'
  })
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public getConfigs() {
    return BlogConfigStorage.get();
  }

  @HTTPRouter({
    pathname: '/api/configs',
    methods: 'POST'
  })
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async setConfigs(@HTTPRequestBody() data: TSetBlogConfigsEntityProps) {
    await this.service.setConfigs(data);
    await BlogConfigStorage.set();
    return Date.now();
  }
}