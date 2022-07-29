import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'blog_categories' })
export class BlogCategoryEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '分类名',
    nullable: false
  })
  public cate_name: string;

  @Column({
    type: 'integer',
    comment: '分类排序',
    default: 0
  })
  public cate_order: number;

  @Column({
    type: 'integer',
    comment: '分类下文章数',
    default: 0
  })
  public cate_count: number;

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