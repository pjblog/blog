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

import mitt from 'mitt';
import dayjs from 'dayjs';
import { Application } from '@zille/application';
import { Logger } from './logger.app';
import { TypeORM } from '@zille/typeorm';
import { BlogVisitorEntity } from '../entities/visitor.entity';

interface IVisitorProps {
  account?: string,
  timestamp: number,
}

@Application.Injectable()
export class Online extends Application {
  @Application.Inject(Logger)
  private readonly logger: Logger;

  @Application.Inject(TypeORM)
  private readonly database: TypeORM;

  public readonly stacks = new Set<string>();
  /**
   * 访问记录
   * 1 string 日期
   * 2 number 小时
   * 3 string token
   * 4 number 时间戳
   */
  public readonly visitors = new Map<string, Map<number, Map<string, IVisitorProps>>>();
  public readonly event = mitt();
  public async setup() {
    const timer = setInterval(() => {
      const day = dayjs().format('YYYY-MM-DD');
      const resolves: Map<number, Map<string, IVisitorProps>>[] = [];
      for (const [key, value] of this.visitors.entries()) {
        if (key !== day) {
          resolves.push(value);
          this.visitors.delete(key);
        }
      }
      this.save(...resolves)
        .catch(e => this.logger.error(e.message));
    }, 30 * 60 * 1000).unref();
    return () => {
      clearInterval(timer);
      this.stacks.clear();
      this.event.off('*');
    }
  }

  get size() {
    return this.stacks.size;
  }

  get list() {
    return Array.from(this.stacks.values());
  }

  public add(token: string) {
    if (!this.stacks.has(token)) {
      this.stacks.add(token);
      this.event.emit('change');
    }
    return this;
  }

  public del(token: string) {
    if (this.stacks.has(token)) {
      this.stacks.delete(token);
      this.event.emit('change');
    }
    return this;
  }

  public addVisitor(token: string, account?: string) {
    const now = Date.now();
    const day = dayjs(now);
    const year = day.format('YYYY-MM-DD');
    const hour = Number(day.format('HH'));
    if (!this.visitors.has(year)) {
      this.visitors.set(year, new Map())
    }
    const Year = this.visitors.get(year);
    if (!Year.has(hour)) {
      Year.set(hour, new Map());
    }
    const Hour = Year.get(hour);
    if (!Hour.has(token)) {
      Hour.set(token, {
        account,
        timestamp: now,
      });
    }
    return this;
  }

  public async save(...args: Map<number, Map<string, IVisitorProps>>[]) {
    if (!args.length) return;
    return this.database.connection.transaction(async runner => {
      const repo = runner.getRepository(BlogVisitorEntity);
      for (let i = 0; i < args.length; i++) {
        const Hour = args[i];
        for (const hour of Hour.values()) {
          for (const [token, { account, timestamp }] of hour.entries()) {
            await repo.save(
              repo.create()
                .add(token, timestamp, account)
            );
          }
        }
      }
    })
  }
}