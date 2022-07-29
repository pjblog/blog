import { inject } from 'inversify';
import { HTTPController, HTTPRequestBody, HTTPRouter, HTTPRouterMiddleware } from '@typeservice/http';
import { BlogConfigsService } from './service';
import { BlogConfigStorage } from './store';
import { TSetBlogConfigsEntityProps } from './types';
import { BlogUserInfoMiddleware, BlogUserLoginedMiddleware, BlogUserLoginedWithAdminMiddleware } from '../../middlewares';

@HTTPController()
export class HttpBlogConfigs {
  @inject(BlogConfigsService) private readonly service: BlogConfigsService;

  /**
   * 获取配置
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/configs',
    methods: 'GET'
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public getConfigs() {
    return this.service.getConfigs();
  }

  @HTTPRouter({
    pathname: '/api/configs',
    methods: 'POST'
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async setConfigs(@HTTPRequestBody() data: TSetBlogConfigsEntityProps) {
    await this.service.setConfigs(data);
    await BlogConfigStorage.set();
    return Date.now();
  }
}