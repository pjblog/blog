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

import { Service } from "@zille/service";
import { DataBaseConnnectionNameSpace } from "../middlewares/database.mdw";
import { DataBaseConnection } from "../global.types";
import { BlogMediaEntity } from "../entities/media.entity";
import { FindOptionsWhere, Not, Equal, LessThan, MoreThan } from "typeorm";
import { BlogMediaCommentEntity } from "../entities/media.comment.entity";
import { BlogUserEntity } from "../entities/user.entity";
import { BlogCategoryEntity } from "../entities/category.entity";
import dayjs from "dayjs";

interface LatestCommentRaw {
  id: string,
  content: string,
  token: string,
  type: string,
  avatar: string,
  nickname: string,
  gmtc: string,
}

@Service.Injectable()
export class MediaService extends Service {
  @Service.Inject(DataBaseConnnectionNameSpace)
  private readonly conn: DataBaseConnection;

  private getRepository() {
    return this.conn.manager.getRepository(BlogMediaEntity);
  }

  private getCommentRepository() {
    return this.conn.manager.getRepository(BlogMediaCommentEntity);
  }

  public save(target: BlogMediaEntity) {
    return this.getRepository().save(target);
  }

  public add(title: string, category: number, description: string, uid: number, type: string) {
    return this.save(this.getRepository().create().add({
      title, category, description, uid, type,
    }))
  }

  public getOneById(id: number) {
    return this.getRepository().findOneBy({ id })
  }

  public getOneByToken(token: string) {
    return this.getRepository().findOneBy({ media_token: token })
  }

  public del(media: BlogMediaEntity) {
    return this.getRepository().remove(media);
  }

  public async getMore(id: number) {
    const sql = this.getRepository().createQueryBuilder('m');
    sql.leftJoin(BlogCategoryEntity, 'c', 'c.id=m.media_category');
    sql.leftJoin(BlogUserEntity, 'u', 'u.id=m.media_user_id');
    sql.where('m.id=:id', { id });
    sql.select('c.id', 'category_id');
    sql.addSelect('c.cate_name', 'category_name');
    sql.addSelect('u.account', 'user_account');
    sql.addSelect('u.nickname', 'user_nickname');
    sql.addSelect('u.avatar', 'user_avatar');
    const raws = await sql.getRawMany<{
      category_id: number,
      category_name: string,
      user_account: string,
      user_nickname: string,
      user_avatar: string,
    }>();

    return {
      category: {
        id: raws[0].category_id,
        name: raws[0].category_name
      },
      user: {
        account: raws[0].user_account,
        nickname: raws[0].user_nickname,
        avatar: raws[0].user_avatar,
      }
    }
  }

  public total(type?: 'article' | 'page') {
    const conditions: FindOptionsWhere<BlogMediaEntity> = {};
    if (type) {
      conditions.media_type = type;
    }
    return this.getRepository().countBy(conditions);
  }

  public async readCount() {
    const rows = await this.getRepository().createQueryBuilder('m')
      .select('SUM(m.media_read_count)', "count")
      .getRawMany<{ count: number }>();
    return rows.reduce((prev, next) => prev + Number(next.count), 0);
  }

  public increaseReadCount(media: BlogMediaEntity, value: number) {
    return this.save(media.updateCount(media.media_read_count + value));
  }

  public async latest(size: number, type?: string) {
    const where: FindOptionsWhere<BlogMediaEntity> = {};
    if (type) {
      where.media_type = type;
    } else {
      where.media_type = Not(Equal(type));
    }
    const medias = await this.getRepository().find({
      where,
      order: {
        gmt_create: 'DESC',
      },
      take: size,
    })

    return medias.map(media => {
      return {
        token: media.media_token,
        type: media.media_type,
        title: media.media_title,
        gmtc: media.gmt_create,
      }
    })
  }

  public async hot(size: number, type?: string) {
    const where: FindOptionsWhere<BlogMediaEntity> = {};
    if (type) {
      where.media_type = type;
    } else {
      where.media_type = Not(Equal(type));
    }
    const medias = await this.getRepository().find({
      where,
      order: {
        media_read_count: 'DESC',
        gmt_create: 'DESC',
      },
      take: size,
    })

    return medias.map(media => {
      return {
        token: media.media_token,
        type: media.media_type,
        title: media.media_title,
        gmtc: media.gmt_create,
      }
    })
  }

  private getPrevOne(date: Date, type: string = null) {
    const where: FindOptionsWhere<BlogMediaEntity> = {};
    if (type !== null) {
      where.media_type = type;
    }
    return this.getRepository().findOne({
      where: {
        ...where,
        gmt_create: LessThan(date)
      },
      order: {
        gmt_create: 'DESC'
      }
    })
  }

  private getNextOne(date: Date, type: string = null) {
    const where: FindOptionsWhere<BlogMediaEntity> = {};
    if (type !== null) {
      where.media_type = type;
    }
    return this.getRepository().findOne({
      where: {
        ...where,
        gmt_create: MoreThan(date)
      },
      order: {
        gmt_create: 'ASC'
      }
    })
  }

  public async prevAndNext(date: Date, type?: string) {
    const [prev, next] = await Promise.all([
      this.getPrevOne(date, type),
      this.getNextOne(date, type),
    ])
    return {
      prev, next,
    }
  }

  public async getManyByType(page: number, size: number, options: {
    type?: string,
    category?: number,
  } = {}) {
    const conditions: FindOptionsWhere<BlogMediaEntity> = {};

    if (typeof options.type === 'string') {
      conditions.media_type = options.type;
    }

    if (typeof options.category === 'number' && options.category > 0) {
      conditions.media_category = options.category;
    }

    return this.getRepository().findAndCount({
      where: conditions,
      skip: (page - 1) * size,
      take: size,
      order: {
        gmt_create: 'DESC',
      }
    })
  }

  public async getMany(page: number, size: number, options: {
    type?: string,
    category?: number,
    date?: {
      year: number,
      month?: number,
      day?: number,
    }
  } = {}) {
    const sql = this.getRepository().createQueryBuilder('m');

    if (!options.type) {
      sql.where('m.media_type<>:type', { type: 'page' });
    } else {
      sql.where('m.media_type=:type', { type: options.type });
    }

    if (options.date) {
      const formats: string[] = ['%Y'];
      const dates: number[] = [options.date.year];
      const _formats: string[] = ['YYYY'];

      if (options.date.month) {
        formats.push('%m');
        dates.push(options.date.month);
        _formats.push('MM');
      }

      if (options.date.day) {
        formats.push('%d');
        dates.push(options.date.day);
        _formats.push('DD');
      }

      sql.andWhere(`DATE_FORMAT(m.gmt_create, '${formats.join('-')}')=:date`, {
        date: dayjs(dates.join('-')).format(_formats.join('-')),
      })
    }

    if (typeof options.category === 'number' && options.category > 0) {
      sql.andWhere('m.media_category=:category', { category: options.category })
    }

    const total = await sql.clone().getCount();

    sql.leftJoin(BlogCategoryEntity, 'c', 'c.id=m.media_category');
    sql.leftJoin(BlogUserEntity, 'u', 'u.id=m.media_user_id');
    sql.leftJoin(BlogMediaCommentEntity, 't', 't.media_id=m.id')

    sql.select('m.media_token', 'token');
    sql.addSelect('m.media_title', 'title');
    sql.addSelect('c.id', 'category_id');
    sql.addSelect('c.cate_name', 'category_name');
    sql.addSelect('m.media_description', 'description');
    sql.addSelect('u.account', 'user_account');
    sql.addSelect('u.nickname', 'user_nickname');
    sql.addSelect('u.avatar', 'user_avatar');
    sql.addSelect('m.media_read_count', 'readCount');
    sql.addSelect('m.media_type', 'type');
    sql.addSelect('m.gmt_create', 'gmtc');
    sql.addSelect('COUNT(t.media_id)', 'comments');

    sql.groupBy('m.id');
    sql.orderBy('m.gmt_create', 'DESC');
    sql.offset((page - 1) * size);
    sql.limit(size);

    const raws = await sql.getRawMany<{
      token: string,
      title: string,
      category_id: number,
      category_name: number,
      description: string,
      user_account: string,
      user_nickname: string,
      user_avatar: string,
      readCount: number,
      type: string,
      gmtc: string,
      comments: number,
    }>();

    return [
      raws.map(raw => {
        return {
          token: raw.token,
          title: raw.title,
          category: raw.category_id ? {
            id: raw.category_id,
            name: raw.category_name
          } : null,
          description: raw.description,
          user: {
            account: raw.user_account,
            nickname: raw.user_nickname,
            avatar: raw.user_avatar
          },
          readCount: raw.readCount,
          comments: Number(raw.comments),
          type: raw.type,
          gmtc: raw.gmtc,
        }
      }),
      total
    ] as const;
  }

  public async latestComments(size: number) {
    const sql = this.getCommentRepository().createQueryBuilder('c');
    sql.leftJoin(BlogMediaEntity, 'm', 'm.id=c.media_id');
    sql.leftJoin(BlogUserEntity, 'u', 'u.id=c.user_id');
    sql.orderBy({
      'c.gmt_create': 'DESC',
    })
    sql.limit(size);
    sql.select('c.id', 'id');
    sql.addSelect('c.content', 'content');
    sql.addSelect('c.gmt_create', 'gmtc');
    sql.addSelect('m.media_token', 'token');
    sql.addSelect('m.media_type', 'type');
    sql.addSelect('u.avatar', 'avatar');
    sql.addSelect('u.nickname', 'nickname');
    const comments = await sql.getRawMany<LatestCommentRaw>();
    return comments.map(comment => {
      return {
        id: Number(comment.id),
        content: comment.content,
        gmtc: comment.gmtc,
        token: comment.token,
        type: Number(comment.type),
        user: {
          avatar: comment.avatar,
          nickname: comment.nickname,
        }
      }
    })
  }

  public async getArchiveList(type?: string) {
    const sql = this.getRepository().createQueryBuilder('m');
    sql.where('m.media_category>0');
    if (type) {
      sql.andWhere('m.media_type=:type', { type });
    } else {
      sql.andWhere('m.media_type<>:type', { type: 'page' });
    }
    sql.select('YEAR(m.gmt_create)', 'year');
    sql.addSelect('MONTH(m.gmt_create)', 'month');
    sql.addSelect('COUNT(1)', 'count');
    sql.groupBy('year');
    sql.addGroupBy('month');
    sql.orderBy({
      year: 'DESC',
      month: 'DESC',
    })
    const res = await sql.getRawMany<{
      year: string,
      month: string,
      count: number
    }>();
    return res.map(({ year, month, count }) => ({
      year: Number(year),
      month: Number(month),
      count: Number(count)
    }))
  }
}