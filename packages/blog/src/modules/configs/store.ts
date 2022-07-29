import { createStorage } from '../../lib';
import { BlogConfigsEntity } from './entity';
import { BlogConfigsService } from './service';

export const BlogConfigStorage = createStorage<{}, BlogConfigsEntity>(
  '/blog/configs', 
  async (options, container) => {
    const result = await container.get(BlogConfigsService).getConfigs();
    return {
      result,
    }
  }
);