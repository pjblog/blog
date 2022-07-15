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

  public async register(account: string, password: string) {
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

  public async setProfile(account: string, options: TBlogUserUpdateProps) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    const User = await this.getProfile(account);
    User.nickname = options.nickname;
    User.email = options.email;
    User.avatar = options.avatar;
    return await repo.save(User);
  }

  public async changeSaltAndPassword(User: BlogUserEntity, password: string) {
    const repo = this.dataSource.getRepository(BlogUserEntity);
    User.salt = generate(6);
    User.password = this.createHashCode(User.salt, password);
    return await repo.save(User);
  }
}