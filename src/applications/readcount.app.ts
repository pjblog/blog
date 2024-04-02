/**
 * Copyright (c) PJBlog Platforms, net. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @Author evio<evio@vip.qq.com>
 * @Website https://www.pjhome.net
 */

'use strict';

import { Application } from '@zille/application';
import { BlogVariable } from './variable.app';
import { Logger } from './logger.app';
import { TypeORM } from '@zille/typeorm';
import { BlogMediaEntity } from '../entities/media.entity';


@Application.Injectable()
export class MediaReadCounter extends Application {
  @Application.Inject(BlogVariable)
  private readonly configs: BlogVariable;

  @Application.Inject(Logger)
  private readonly logger: Logger;

  @Application.Inject(TypeORM)
  private readonly database: TypeORM;

  private handing = false;
  private readonly handlers = new Set<{ token: string, count: number }>();
  public readonly stacks = new Map<string, {
    pool: Map<string, number>,
    count: number,
  }>();
  public setup() {
    const timer = setInterval(() => {
      const now = Date.now();
      const expire = this.configs.get('mediaReadCountExpire');
      for (const [token, { pool, count }] of this.stacks.entries()) {
        for (const [key, time] of pool.entries()) {
          if (time + expire * 60 * 60 * 1000 < now) {
            pool.delete(key);
          }
        }
        if (!pool.size && !count) {
          this.stacks.delete(token);
        }
        if (count) {
          this.handlers.add({ token, count });
          this.stacks.get(token).count = 0;
        }
      }
      this.trigger();
    }, 300);
    return () => clearInterval(timer);
  }

  private trigger() {
    if (this.handing || !this.handlers.size) return;
    this.handing = true;
    const fns = Array.from(this.handlers.values());
    this.handlers.clear();
    Promise.all(fns.map(({ token, count }) => this.execute(token, count)))
      .catch(e => this.logger.error(e.message))
      .finally(() => this.handing = false);
  }

  public add(token: string, value: string) {
    if (!this.stacks.has(token)) {
      this.stacks.set(token, {
        pool: new Map(),
        count: 0,
      });
    }
    const target = this.stacks.get(token);
    if (!target.pool.has(value)) {
      target.pool.set(value, Date.now());
      target.count++;
    }
  }

  public del(token: string, value: string) {
    if (this.stacks.has(token)) {
      const target = this.stacks.get(token);
      if (target.pool.has(value)) {
        target.pool.delete(value);
      }
    }
  }

  public replace(token: string, source: string, target: string) {
    if (this.stacks.has(token)) {
      const current = this.stacks.get(token);
      if (current.pool.has(source)) {
        const expire = current.pool.get(source);
        current.pool.delete(source);
        current.pool.set(target, expire);
      }
    }
  }

  public async execute(token: string, size: number) {
    const repo = this.database.connection.getRepository(BlogMediaEntity);
    const media = await repo.findOneBy({ media_token: token });
    if (media) {
      await repo.save(media.updateCount(media.media_read_count + size));
    }
  }
}