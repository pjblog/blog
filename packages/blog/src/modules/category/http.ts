import { inject } from 'inversify';
import { HTTPController, HTTPRequestBody, HTTPRequestParam, HTTPRequestQuery, HTTPRouter, HTTPRouterMiddleware } from '@typeservice/http';
import { BlogCategoryService } from './service';
import { BlogCategoryStorage } from './store';
import { TSetBlogCategoryEntityProps } from './types';
import { BlogUserInfoMiddleware, BlogUserLoginedMiddleware, BlogUserLoginedWithAdminMiddleware } from '../../middlewares';
import { HttpNotFoundException } from '@typeservice/exception';

@HTTPController()
export class HttpBlogCategory {
  @inject(BlogCategoryService) private readonly service: BlogCategoryService;

  @HTTPRouter({
    pathname: '/api/category',
    methods: 'POST'
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async addCategory(
    @HTTPRequestBody() data: TSetBlogCategoryEntityProps
  ) {
    const category = await this.service.add(data.cate_name, data.cate_order);
    await BlogCategoryStorage.set();
    return category;
  }

  @HTTPRouter({
    pathname: '/api/category',
    methods: 'GET'
  })
  public all(@HTTPRequestQuery('db', Number) db: number) {
    if (db) return this.service.getAll();
    return BlogCategoryStorage.get();
  }

  @HTTPRouter({
    pathname: '/api/category/:id(\\d+)',
    methods: 'PUT'
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async updateCategory(
    @HTTPRequestParam('id', Number) id: number,
    @HTTPRequestBody() data: TSetBlogCategoryEntityProps,
  ) {
    if (id === 0) return await this.addCategory(data);
    const category = await this.service.getOne(id);
    if (!category) throw new HttpNotFoundException();
    const result = await this.service.updateName(category, data.cate_name);
    await BlogCategoryStorage.set();
    return result;
  }

  @HTTPRouter({
    pathname: '/api/category/order',
    methods: 'PUT'
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async updateOrder(@HTTPRequestBody() data: number[]) {
    await this.service.updateOrder(data);
    await BlogCategoryStorage.set();
    return Date.now();
  }

  @HTTPRouter({
    pathname: '/api/category/:id(\\d+)',
    methods: 'DELETE'
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async delCategory(
    @HTTPRequestParam('id', Number) id: number,
  ) {
    const category = await this.service.getOne(id);
    if (!category) throw new HttpNotFoundException();
    await this.service.del(category);
    await BlogCategoryStorage.set();
    return Date.now();
  }
}