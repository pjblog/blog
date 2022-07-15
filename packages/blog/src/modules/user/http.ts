import { inject } from 'inversify';
import { HTTPController, HTTPCookie, HTTPRequestBody, HTTPRequestState, HTTPRouter, HTTPRouterMiddleware } from '@typeservice/http';
import { BlogUserService } from './service';
import { BlogUserStorage } from './store';
import { TBlogUserUpdateProps } from './types';
import type { TCookie } from '@typeservice/http';
import { PJBLOG_CACHE_CONTEXT } from '../../utils';
import { BlogConfigStorage } from '../configs';
import { HttpNotAcceptableException, HttpPreconditionFailedException, HttpNotFoundException, HttpForbiddenException } from '@typeservice/exception';
import { BlogUserLoginedMiddleware } from './middleware';
import { BlogUserEntity } from './entity';

@HTTPController()
export class HttpBlogUser {
  @inject(BlogUserService) private readonly service: BlogUserService;

  get cache() {
    return PJBLOG_CACHE_CONTEXT.value;
  }

  /**
   * 注册新用户
   * @param data 
   * @param cookie 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/user',
    methods: 'PUT',
  })
  public async register(
    @HTTPRequestBody() data: { account: string, password: string },
    @HTTPCookie() cookie: TCookie,
  ) {
    let user = await this.service.getProfile(data.account);
    if (user) throw new HttpNotAcceptableException();
    user = await this.service.register(data.account, data.password);
    await BlogUserStorage.set({ account: data.account });
    return await this.login(data, cookie);
  }

  /**
   * 更新个人信息
   * @param data 
   * @param profile 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/user',
    methods: 'POST',
  })
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  public async updateProfile(
    @HTTPRequestBody() data: TBlogUserUpdateProps,
    @HTTPRequestState('profile') profile: BlogUserEntity,
  ) {
    let user = await this.service.getProfile(profile.account);
    if (!user) throw new HttpPreconditionFailedException();
    user = await this.service.setProfile(profile.account, data);
    await BlogUserStorage.set({ account: profile.account });
    return user;
  }

  /**
   * 登录
   * @param data 
   * @param cookie 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/login',
    methods: 'POST',
  })
  public async login(
    @HTTPRequestBody() data: { account: string, password: string },
    @HTTPCookie() cookie: TCookie
  ) {
    // 校验用户账号是否存在
    let User = await this.service.getProfile(data.account);
    if (!User) throw new HttpNotFoundException();

    // 校验密码是否匹配
    const oldHash = this.service.createHashCode(User.salt, data.password);
    if (oldHash !== User.password) throw new HttpForbiddenException();

    // 修改密码加盐
    User = await this.service.changeSaltAndPassword(User, data.password);
    await BlogUserStorage.set({ account: data.account });

    // 更新登录缓存信息
    // 仅支持单端登录
    const accountNamespace = '/blog/login/account/' + data.account;
    const hash = await this.cache.get<string>(accountNamespace);
    if (hash) await this.cache.del('/blog/login/hash/' + hash);
    await this.cache.set('/blog/login/hash/' + User.password, data.account);
    await this.cache.set(accountNamespace, User.password);

    // 设置cookie
    const configs = await BlogConfigStorage.get();
    const maxAge = configs.blog_login_expires * 24 * 60 * 60 * 1000;
    const expires = new Date(Date.now() + maxAge);
    cookie.set(configs.blog_cache_namespace, User.password, {
      path: '/',
      signed: true,
      maxAge,
      expires,
    })

    return Date.now();
  }
}