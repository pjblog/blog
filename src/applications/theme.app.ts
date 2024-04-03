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

import { Application } from "@zille/application";
import { BlogVariable } from "./variable.app";
import { Newable } from "@zille/http-controller";
import { Exception } from "../lib/exception";
import { AcceptWebPageNameSpace } from "../global.types";

@Application.Injectable()
export class Themes extends Application {
  @Application.Inject(BlogVariable)
  private readonly configs: BlogVariable;

  private readonly stacks = new Map<string, Map<AcceptWebPageNameSpace, Newable>>();

  get current() {
    const name = this.configs?.get('theme');
    if (!name || !this.stacks.has(name)) throw new Exception(400, '找不到主题');
    return this.stacks.get(name);
  }

  public setup() { }

  public has(name: string) {
    return this.stacks.has(name)
  }

  public add(plugin: string, name: AcceptWebPageNameSpace, theme: Newable) {
    if (!this.stacks.has(plugin)) {
      this.stacks.set(plugin, new Map());
    }
    this.stacks.get(plugin).set(name, theme);
    return this;
  }

  public del(name: string) {
    if (this.stacks.has(name)) {
      this.stacks.delete(name);
    }
    return this;
  }

  public getAllNames() {
    return Array.from(this.stacks.keys());
  }
}