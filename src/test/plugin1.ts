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

import {
  Plugin,
  SystemConfigsSchema
} from '../index';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const readme = readFileSync(resolve(__dirname, 'readme.md'), 'utf8')

@Plugin.Injectable()
export class BlogPlugin1 extends Plugin {
  public readonly cwd: string = resolve(process.cwd(), 'src', 'test');
  public readonly code: string = '5c59f49d2e796f5379f13e31c149abca';
  public readonly version: string = '1.0.1';
  public readonly name: string = 'pjblog-plugin-hot-article';
  public readonly description: string = '使用 Modal.destroyAll() 可以销毁弹出的确认窗。通常用于路由监听当中，处理路由前进、后退不能销毁确认对话框的问题。一款基于react的图片预览组件，特别适合于异步获取的富文本中的图片，点';
  public readonly readme: string = readme;
  public readonly cover: string = null;
  public readonly previews: string[] = [];
  public readonly schema = SystemConfigsSchema;
  public readonly advanceStaticDirectory: string = resolve(__dirname, 'dist');

  public async initialize() {
    console.log('BlogPlugin1 initialized')
  };
}