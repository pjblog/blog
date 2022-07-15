import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: 'blog_users' })
@Index(['account'])
@Index(['gmt_create'])
@Index(['gmt_modified'])
export class BlogUserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '用户登入账号，在同一种登录类型下必须唯一',
    nullable: false
  })
  public account: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '昵称',
    nullable: false,
  })
  public nickname: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '邮箱',
    nullable: true,
  })
  public email: string;

  @Column({
    type: 'text',
    comment: '头像',
    nullable: true,
  })
  public avatar: string;

  @Column({
    type: 'varchar',
    length: 40,
    comment: '密码编码',
    nullable: false,
  })
  public password: string;

  @Column({
    type: 'varchar',
    length: 6,
    comment: '盐',
    nullable: false,
  })
  public salt: string;

  @Column({
    type: 'bool',
    default: false,
    comment: '是否禁止登录'
  })
  public forbiden: boolean;

  @Column({
    type: 'integer',
    comment: '用户等级 0: 超级管理员 1: 普通会员',
    default: 1
  })
  public level: number;

  @Column({
    type: 'timestamp',
    comment: '创建时间'
  })
  public gmt_create: Date;

  @Column({
    type: 'timestamp',
    comment: '更新时间'
  })
  public gmt_modified: Date;
}