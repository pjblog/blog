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

import { Schema } from "../lib/schema/schema.lib";

export const SystemConfigsSchema = new Schema.Object()
  .description('整站配置')
  .set('theme',
    new Schema.String('pjblog-theme-default')
      .title('主题')
      .description('选择设置博客的主题（系统操作）')
      .required()
      .style('width', 250)
      .placeholder('博客主题')
      .readOnly()
  )
  .set('title',
    new Schema.String('PJBlog Geek')
      .title('博客名称')
      .description('设置合适的博客名称有利于 SEO 收录')
      .style('width', 400)
      .placeholder('博客名称')
      .required()
  )
  .set('description',
    new Schema.String('Another PJBlog, enjoy it!')
      .title('博客描述')
      .description('设置合适的博客描述有利于 SEO 收录')
      .format('textarea')
      .style('width', 400)
      .placeholder('博客描述')
      .required()
  )
  .set('domain',
    new Schema.String('http://127.0.0.1')
      .title('博客域名')
      .description('博客域名将影响部分功能，特别是下载功能的前缀地址')
      .style('width', 400)
      .placeholder('http://')
      .required()
  )
  .set('icp',
    new Schema.String()
      .title('博客备案号')
      .description('博客的备案号，如果没有备案号可留空')
      .placeholder('博客备案号')
      .required()
  )
  .set('keywords',
    new Schema.Array([])
      .title('博客关键字')
      .items(
        new Schema.String()
          .placeholder('关键字')
          .style('width', 200)
      )
      .description('博客关键字，关键字描述，利于 SEO 收录')
      .required()
  )
  .set('close',
    new Schema.Bool(false)
      .title('博客是否关闭')
      .description('如果关闭博客，用于将无法登录博客，但是管理员可以登录后台系统')
      .labels(['开放', '关闭'])
      .required()
  )
  .set('closeReason',
    new Schema.String('Website closed')
      .title('博客关闭原因')
      .description('关闭博客的原因，将显示在前台告知用户')
      .format('textarea')
      .placeholder('博客关闭原因')
      .style('width', 400)
      .required()
  )
  .set('bodyJSONLimit',
    new Schema.Number(2)
      .title('JSON Limit Size')
      .description('请求体中JSON数据允许的长度，单位：mb')
      .required()
  )
  .set('bodyFORMLimit',
    new Schema.Number(10)
      .title('FORM Limit Size')
      .description('请求体中FORM数据允许的长度，单位：mb')
      .required()
  )
  .set('swagger',
    new Schema.Bool(true)
      .title('Swagger')
      .description('是否开放 Swagger 接口')
      .labels(['禁止', '开放'])
      .required()
  )
  .set('registable',
    new Schema.Bool(true)
      .title('开放注册')
      .description('是否允许自由注册')
      .labels(['禁止', '开放'])
      .required()
  )
  .set('loginExpire',
    new Schema.Number(7)
      .title('登录有效期')
      .description('用户登录有效期 单位：天，系统将保持 N 天无需登录')
      .required()
  )
  .set('sessionMaxAge',
    new Schema.Number(365)
      .title('Session key 存续标记用户时间')
      .description('单位：天。N 天不过期')
      .required()
  )
  .set('mediaReadCountExpire',
    new Schema.Number(24)
      .title('媒体阅读量用户记录有效期')
      .description('单位：小时。N 天不过期')
      .required()
  )
  .set('mediaQueryWithPageSize',
    new Schema.Number(10)
      .title('媒体列表分页大小')
      .description('设置媒体列表每页的数量')
      .required()
  )
  .set('mediaLatestWithSize',
    new Schema.Number(5)
      .title('最新媒体数量')
      .description('侧边栏最新媒体列表的数量')
      .required()
  )
  .set('mediaHotWithSize',
    new Schema.Number(5)
      .title('最热媒体数量')
      .description('侧边栏最热媒体列表的数量')
      .required()
  )
  .set('mediaCommentable',
    new Schema.Bool(true)
      .title('是否允许评论')
      .description('敏感时期可以通过此项关闭评论')
      .required()
  )
  .set('mediaCommentWithLatestSize',
    new Schema.Number(5)
      .title('最新评论数量')
      .description('侧边栏最新评论列表的数量')
      .required()
  )
  .set('mediaCommentWithPageSize',
    new Schema.Number(10)
      .title('父评论分页大小')
      .description('媒体详情页中每页的父评论数量')
      .required()
  )
  .set('mediaCommentWithChildrenPageSize',
    new Schema.Number(3)
      .title('子评论分页大小')
      .description('媒体详情页中每页的子评论数量')
      .required()
  )
  .set('mediaRelativeWithPageSize',
    new Schema.Number(5)
      .title('相关媒体数量')
      .description('媒体详情页中相关媒体数量')
      .required()
  )