import { injectable } from 'inversify';
import { PBLOG_ORM_DATASOURCE_CONTEXT } from '../../utils';
import { BlogConfigsEntity } from './entity';
import { TSetBlogConfigsEntityProps } from './types';

@injectable()
export class BlogConfigsService {

  get dataSource() {
    return PBLOG_ORM_DATASOURCE_CONTEXT.value;
  }

  /**
   * 获取配置信息
   * @returns 
   */
  public async getConfigs() {
    const repo = this.dataSource.getRepository(BlogConfigsEntity);
    const rows = await repo.find();
    if (!rows.length) return;
    return rows[0];
  }

  /**
   * 更新配置信息
   * @param options 
   * @returns 
   */
  public async setConfigs(options: TSetBlogConfigsEntityProps) {
    const repo = this.dataSource.getRepository(BlogConfigsEntity);
    const configs = await this.getConfigs();
    configs.blog_cache_mode = options.blog_cache_mode;
    configs.blog_close = options.blog_close;
    configs.blog_description = options.blog_description;
    configs.blog_name = options.blog_name;
    configs.gmt_modified = new Date();
    configs.blog_cache_namespace = options.blog_cache_namespace;
    configs.blog_login_expires = options.blog_login_expires;
    return await repo.save(configs);
  }
}