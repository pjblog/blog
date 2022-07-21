import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'blog_configs' })
export class BlogConfigsEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '博客名称',
    nullable: false
  })
  public blog_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '博客描述',
    nullable: false,
  })
  public blog_description: string;

  @Column({
    type: 'bool',
    comment: '是否关闭网站',
    default: false
  })
  public blog_close: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '缓存模式',
    nullable: false,
  })
  public blog_cache_mode: 'file' | 'redis';

  @Column({
    type: 'varchar',
    length: 10,
    comment: '博客命名空间',
    nullable: false,
  })
  public blog_cache_namespace: string;

  @Column({
    type: 'integer',
    comment: '博客登录有效时间：单位天',
    default: 7
  })
  public blog_login_expires: number;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '博客主题',
    nullable: true,
  })
  public blog_theme: string;

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