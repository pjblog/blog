import { injectable } from 'inversify';
import { PBLOG_ORM_DATASOURCE_CONTEXT } from '../../utils';
import { BlogCategoryEntity } from './entity';
import { TSetBlogCategoryEntityProps } from './types';

@injectable()
export class BlogCategoryService {

  get dataSource() {
    return PBLOG_ORM_DATASOURCE_CONTEXT.value;
  }

  /**
   * 获取所有分类
   * @returns 
   */
  public async getAll() {
    const repo = this.dataSource.getRepository(BlogCategoryEntity);
    const rows = await repo.find();
    return rows.sort((prev, next) => prev.cate_order - next.cate_order);
  }

  /**
   * 获取单个分类
   * @param id 
   * @returns 
   */
  public async getOne(id: number) {
    const repo = this.dataSource.getRepository(BlogCategoryEntity);
    return await repo.findOne({ where: { id } });
  }

  /**
   * 更新分类信息
   * @param options 
   * @returns 
   */
  public async updateName(Category: BlogCategoryEntity, name: string) {
    const repo = this.dataSource.getRepository(BlogCategoryEntity);
    Category.cate_name = name;
    Category.gmt_modified = new Date();
    return await repo.save(Category);
  }

  /**
   * 更新排序
   * @param orders 
   */
  public async updateOrder(orders: number[]) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const repo = runner.manager.getRepository(BlogCategoryEntity);
      for (let i = 0; i < orders.length; i++) {
        const id = orders[i];
        const category = await repo.findOne({ where: { id } });
        category.cate_order = i + 1;
        await repo.save(category);
      }
      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  /**
   * 新增分类
   * @param name 
   * @param order 
   * @returns 
   */
  public async add(name: string, order: number = 99) {
    const repo = this.dataSource.getRepository(BlogCategoryEntity);
    const Category = new BlogCategoryEntity();
    Category.cate_count = 0;
    Category.cate_name = name;
    Category.cate_order = order;
    Category.gmt_create = new Date();
    Category.gmt_modified = new Date();
    return await repo.save(Category);
  }

  /**
   * 删除分类
   * @param Category 
   * @returns 
   */
  public async del(Category: BlogCategoryEntity) {
    const repo = this.dataSource.getRepository(BlogCategoryEntity);
    return await repo.delete(Category);
  }
}