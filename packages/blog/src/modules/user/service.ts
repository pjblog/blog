import * as gravatar from 'gravatar';
import { injectable } from 'inversify';
import { PBLOG_ORM_DATASOURCE_CONTEXT } from '../../utils';
import { BlogUserEntity } from './entity';
import { generate } from 'randomstring';
import { SHA1 } from 'crypto-js';
import { TBlogUserUpdateProps } from './types';

@injectable()
export class BlogUserService {

  get dataSource() {
    return PBLOG_ORM_DATASOURCE_CONTEXT.value;
  }

  public createHashCode(salt: string, password: string) {
    return SHA1(password + ':' + salt).toString();
  }

  public async getProfile(account: string) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    return await repo.findOne({ where: { account } });
  }

  public async add(account: string, password: string) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    const User = new BlogUserEntity();
    User.account = account;
    User.nickname = account;
    User.salt = generate(6);
    User.password = this.createHashCode(User.salt, password);
    User.gmt_create = new Date();
    User.gmt_modified = new Date();
    return await repo.save(User);
  }

  public async setProfile(User: BlogUserEntity, options: TBlogUserUpdateProps) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    User.nickname = options.nickname;
    User.email = options.email;
    User.avatar = gravatar.url(options.email, { protocol: 'https' });
    return await repo.save(User);
  }

  public async setPassword(User: BlogUserEntity, password: string) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    User.salt = generate(6);
    User.password = this.createHashCode(User.salt, password);
    return await repo.save(User);
  }

  public async setLevel(User: BlogUserEntity, level: number) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    User.level = level;
    return await repo.save(User);
  }

  public async setForbiden(User: BlogUserEntity, forbiden: boolean) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    User.forbiden = forbiden;
    return await repo.save(User);
  }

  public async getUsers(keyword: string, isAdmin: boolean, isForbiden: boolean, page: number = 1, size: number) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    const query = repo.createQueryBuilder('u');
    query.where('1=1');
    if (keyword) query.andWhere('(u.nickname LIKE :keyword OR u.account LIKE :keyword)', { keyword: '%' + keyword + '%' });
    if (isAdmin) query.andWhere('u.level=:level', { level: 0 });
    query.andWhere('u.forbiden=:forbiden', { forbiden: isForbiden });
    return await query
      .offset((page - 1) * size)
      .limit(size)
      .getManyAndCount();
  }
}