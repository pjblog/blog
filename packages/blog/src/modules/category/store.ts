import { createStorage } from '../../lib';
import { BlogCategoryEntity } from './entity';
import { BlogCategoryService } from './service';

export const BlogCategoryStorage = createStorage<{}, BlogCategoryEntity[]>(
  '/blog/categories', 
  async (options, container) => {
    const result = await container.get(BlogCategoryService).getAll();
    return {
      result,
    }
  }
);