import { inject } from 'inversify';
import { BlogUserEntity } from './entity';
import { BlogUserService } from './service';
import { BlogUserStorage } from './store';
import { PJBLOG_CACHE_CONTEXT } from '../../utils';
import { BlogConfigStorage } from '../configs';
import { BlogUserChangePasswordProps, TBlogUserUpdateProps } from './types';
import { BlogUserInfoMiddleware, BlogUserLoginedMiddleware, BlogUserLoginedWithAdminMiddleware } from '../../middlewares';
import { HTTPController, HTTPCookie, HTTPRequestBody, HTTPRequestParam, HTTPRequestQuery, HTTPRequestState, HTTPRouter, HTTPRouterMiddleware, TCookie } from '@typeservice/http';
import { HttpNotAcceptableException, HttpPreconditionFailedException, HttpNotFoundException, HttpForbiddenException } from '@typeservice/exception';

@HTTPController()
export class HttpBlogUser {
  @inject(BlogUserService) private readonly service: BlogUserService;

  get cache() {
    return PJBLOG_CACHE_CONTEXT.value;
  }

  private createSafeUserEntity(profile: BlogUserEntity) {
    delete profile.salt;
    delete profile.password;
    return profile;
  }

  /**
   * 设置COOKIE
   * @param cookie 
   * @param hash 
   */
   private async setCookie(cookie: TCookie, hash: string) {
    // 设置cookie
    const configs = await BlogConfigStorage.get();
    const maxAge = configs.blog_login_expires * 24 * 60 * 60 * 1000;
    const expires = new Date(Date.now() + maxAge);
    cookie.set(configs.blog_cache_namespace, hash, {
      path: '/',
      signed: true,
      httpOnly: true,
      maxAge,
      expires,
    })
  }

  /**
   * 清除COOKIE
   * @param cookie 
   */
  private async clearCookie(cookie: TCookie) {
    const configs = await BlogConfigStorage.get();
    cookie.set(configs.blog_cache_namespace, '', {
      path: '/',
      signed: true,
      httpOnly: true,
      maxAge: 0,
      expires: new Date(0),
    })
  }

  /**
   * 注册新用户
   * @param data 
   * @param cookie 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/user',
    methods: 'POST',
  })
  public async register(
    @HTTPRequestBody() data: { account: string, password: string },
    @HTTPCookie() cookie: TCookie,
  ) {
    let user = await this.service.getProfile(data.account);
    if (user) throw new HttpNotAcceptableException();
    user = await this.service.add(data.account, data.password);
    await BlogUserStorage.set({ account: data.account });
    return await this.login(data, cookie);
  }

  @HTTPRouter({
    pathname: '/api/user',
    methods: 'GET',
  })
  public async users(
    @HTTPRequestQuery('keyword') keyword: string,
    @HTTPRequestQuery('admin', Number, Boolean) isAdmin: boolean,
    @HTTPRequestQuery('forbiden', Number, Boolean) isForbiden: boolean,
    @HTTPRequestQuery('page', Number) page: number,
    @HTTPRequestQuery('size', Number) size: number,
  ) {
    const [list, total] = await this.service.getUsers(keyword, isAdmin, isForbiden, page, size);
    return {
      users: list.map(u => this.createSafeUserEntity(u)),
      total,
    }
  }

  /**
   * 更新个人信息
   * @param data 
   * @param profile 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/user',
    methods: 'PUT',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  public async setUserProfile(
    @HTTPRequestBody() data: TBlogUserUpdateProps,
    @HTTPRequestState('profile') profile: BlogUserEntity,
  ) {
    let user = await this.service.getProfile(profile.account);
    if (!user) throw new HttpPreconditionFailedException();
    user = await this.service.setProfile(user, data);
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
    methods: 'PUT',
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
    User = await this.service.setPassword(User, data.password);
    await BlogUserStorage.set({ account: data.account });

    // 更新登录缓存信息
    // 仅支持单端登录
    const accountNamespace = '/blog/login/account/' + data.account;
    const hash = await this.cache.get<string>(accountNamespace);
    if (hash) await this.cache.del('/blog/login/hash/' + hash);
    await this.cache.set('/blog/login/hash/' + User.password, data.account);
    await this.cache.set(accountNamespace, User.password);
    this.setCookie(cookie, User.password);
    return Date.now();
  }

  /**
   * 退出登录
   * @param profile 
   * @param cookie 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/logout',
    methods: 'DELETE',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  public async logout(
    @HTTPRequestState('profile') profile: BlogUserEntity,
    @HTTPCookie() cookie: TCookie
  ) {
    const accountNamespace = '/blog/login/account/' + profile.account;
    const hash = await this.cache.get<string>(accountNamespace);
    if (hash) await this.cache.del('/blog/login/hash/' + hash);
    await this.cache.del(accountNamespace);
    await this.clearCookie(cookie);
    return Date.now();
  }

  /**
   * 获取主题页当前用户信息
   * @param profile 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/me',
    methods: 'GET',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  public getMyInfo(@HTTPRequestState('profile') profile: BlogUserEntity) {
    return this.createSafeUserEntity(profile);
  }

  /**
   * 获取后台管理系统当前用户信息
   * @param profile 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/me/admin',
    methods: 'GET',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public getMyInfoByAdmin(@HTTPRequestState('profile') profile: BlogUserEntity) {
    return this.createSafeUserEntity(profile);
  }

  /**
   * 修改密码
   * @param profile 
   * @param data 
   * @param cookie 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/me/password',
    methods: 'PUT',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  public async setUserPassword(
    @HTTPRequestState('profile') profile: BlogUserEntity,
    @HTTPRequestBody() data: BlogUserChangePasswordProps,
    @HTTPCookie() cookie: TCookie
  ) {
    if (data.newPassword !== data.comPassword) throw new HttpNotAcceptableException();
    const User = await this.service.getProfile(profile.account);
    const currentHash = this.service.createHashCode(User.salt, data.oldPassword);
    // 密码不匹配
    if (currentHash !== User.password) throw new HttpNotAcceptableException();
    const { password: hash } = await this.service.setPassword(User, data.newPassword);
    await BlogUserStorage.set({ account: profile.account });
    this.setCookie(cookie, hash);
    return Date.now();
  }

  /**
   * 升级管理员
   * @param profile 
   * @param data 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/user/:account/admin',
    methods: 'PUT',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async setUserAdmin(
    @HTTPRequestState('profile') profile: BlogUserEntity,
    @HTTPRequestParam('account') account: string,
    @HTTPRequestBody() data: { admin: boolean }
  ) {
    const user = await this.service.getProfile(account);
    if (!user) throw new HttpNotFoundException();
    // 不能修改自己
    if (user.account === profile.account) throw new HttpNotAcceptableException();
    if ((user.level !== 0 && !!data.admin) || (user.level === 0 && !data.admin)) {
      await this.service.setLevel(user, data.admin ? 0 : 1);
      await BlogUserStorage.set({ account: profile.account });
    }
    return Date.now();
  }

  /**
   * 禁止用户登录
   * @param profile 
   * @param account 
   * @returns 
   */
  @HTTPRouter({
    pathname: '/api/user/:account/forbiden',
    methods: 'PUT',
  })
  @HTTPRouterMiddleware(BlogUserInfoMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedMiddleware)
  @HTTPRouterMiddleware(BlogUserLoginedWithAdminMiddleware)
  public async setUserForbiden(
    @HTTPRequestState('profile') profile: BlogUserEntity,
    @HTTPRequestParam('account') account: string,
    @HTTPRequestBody() data: { forbiden: boolean }
  ) {
    const user = await this.service.getProfile(account);
    if (!user) throw new HttpNotFoundException();
    // 不能修改自己
    if (user.account === profile.account) throw new HttpNotAcceptableException();
    await this.service.setForbiden(user, data.forbiden);
    await BlogUserStorage.set({ account: profile.account });
    return Date.now();
  }
}