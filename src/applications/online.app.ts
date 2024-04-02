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
import { Application } from '@zille/application';

@Application.Injectable()
export class Online extends Application {
  public readonly stacks = new Set<string>();
  public readonly event = mitt();
  public setup() {

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
}