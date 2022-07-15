import { createStorage } from '../../lib';
import { BlogUserEntity } from './entity';
import { BlogUserService } from './service';

export const BlogUserStorage = createStorage<{ account: string }, BlogUserEntity>(
  '/blog/user/:account', 
  async (options, container) => {
    const result = await container.get(BlogUserService).getProfile(options.account);
    return {
      result,
    }
  }
);