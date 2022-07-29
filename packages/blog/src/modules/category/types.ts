import { BlogCategoryEntity } from './entity';

export interface TSetBlogCategoryEntityProps {
  readonly cate_name: BlogCategoryEntity['cate_name'],
  readonly cate_order?: BlogCategoryEntity['cate_order'],
};
