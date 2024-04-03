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
import { BlogMediaCommentEntity } from "../entities/media.comment.entity";
import { BlogUserEntity } from "../entities/user.entity";
import { Media } from "../applications/media.app";

interface RawComment {
  id: number,
  uid: number,
  nickname: string,
  account: string,
  avatar: string,
  content: string,
  gmtc: string | Date,
  gmtm: string | Date,
  children: number,
  parent: number,
}

interface RowComment {
  id: number,
  content: string,
  gmtc: string | Date,
  gmtm: string | Date,
  children: number,
  parent: number,
  user: {
    nickname: string,
    avatar: string,
    account: string,
  }
}

@Service.Injectable()
export class MediaCommentService extends Service {
  @Service.Inject(DataBaseConnnectionNameSpace)
  private readonly conn: DataBaseConnection;

  @Service.Inject(Media.Middleware_Store_NameSpace)
  private readonly media: BlogMediaEntity;

  private getRepository() {
    return this.conn.manager.getRepository(BlogMediaCommentEntity);
  }

  public total() {
    return this.getRepository().count();
  }

  public save(target: BlogMediaCommentEntity) {
    return this.getRepository().save(target);
  }

  public add(user: number, content: string, parent: number = 0) {
    return this.save(this.getRepository().create().add(this.media.id, user, content, parent));
  }

  public del() {
    return this.getRepository().delete({
      media_id: this.media.id,
    })
  }

  public getOneById(id: number) {
    return this.getRepository().findOneBy({
      media_id: this.media.id, id,
    })
  }

  public async delOneById(id: number) {
    const repo = this.getRepository();
    const children = await repo.findBy({
      media_id: this.media.id,
      parent_id: id
    })
    await Promise.all(children.map(child => this.delOneById(child.id)));
    await repo.delete({
      media_id: this.media.id,
      id,
    })
  }

  public async delOne(comment: BlogMediaCommentEntity) {
    const repo = this.getRepository();
    const children = await repo.findBy({
      media_id: this.media.id,
      parent_id: comment.id,
    })
    await Promise.all(children.map(child => this.delOne(child)));
    await repo.remove(comment);
  }

  public async getMany(page: number, size: number, parent_id: number = 0) {
    const sql = this.getRepository().createQueryBuilder('c');
    sql.leftJoin(BlogUserEntity, 'u', 'u.id=c.user_id');
    sql.where('c.media_id=:media_id', { media_id: this.media.id });
    sql.andWhere('c.parent_id=:parent_id', { parent_id });

    const count = await sql.clone().getCount();

    sql.select('c.id', 'id');
    sql.addSelect('u.nickname', 'nickname');
    sql.addSelect('u.account', 'account');
    sql.addSelect('u.avatar', 'avatar');
    sql.addSelect('c.content', 'content');
    sql.addSelect('c.gmt_create', 'gmtc');
    sql.addSelect('c.gmt_modified', 'gmtm');
    sql.addSelect('c.child_count', 'children');
    sql.addSelect('c.parent_id', 'parent');

    sql.orderBy('c.gmt_create', 'DESC');
    sql.offset((page - 1) * size);
    sql.limit(size);

    const data = await sql.getRawMany<RawComment>();
    const rows = data.map<RowComment>(raw => ({
      id: raw.id,
      content: raw.content,
      gmtc: raw.gmtc,
      gmtm: raw.gmtm,
      children: raw.children,
      parent: raw.parent,
      user: {
        nickname: raw.nickname,
        avatar: raw.avatar,
        account: raw.account,
      }
    }))

    return [rows, count] as const;
  }
}