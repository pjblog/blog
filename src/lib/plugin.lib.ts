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

import { Application } from '@zille/application';
import { SchemaBase } from './schema/base';
import { Storage } from '../applications/cache/cache.app';
import { Variable } from './variable.lib';
import { Newable } from '@zille/http-controller';
import { Themes } from '../applications/theme.app';
import { AcceptWebPageNameSpace } from '../global.types';

@Application.Injectable()
export abstract class Plugin<T extends object = any> extends Application {
  public abstract readonly cwd: string;
  public abstract readonly code: string;
  public abstract readonly version: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly readme: string;
  public abstract readonly schema: SchemaBase;
  public abstract readonly cover: string;
  public abstract readonly previews: string[];
  public abstract readonly advanceStaticDirectory: string;
  public abstract initialize(): unknown;
  public uninstall?: Function;

  public toJSON() {
    return {
      cwd: this.cwd,
      code: this.code,
      version: this.version,
      name: this.name,
      description: this.description,
      readme: this.readme,
      cover: this.cover,
      previews: this.previews,
      advancable: !!this.advanceStaticDirectory,
      configable: !!this.schema,
    }
  }

  public async terminate() {
    const themes = await this.$use(Themes);
    themes.del(this.name);
    if (typeof this.uninstall === 'function') {
      const uninstall = this.uninstall;
      this.uninstall = uninstall;
      await Promise.resolve(uninstall());
    }
  }

  public configs: Variable<T>;
  public async initConfigs() {
    if (this.schema) {
      const cache = await this.$use(Storage);
      this.configs = new Variable('plugin:' + this.name, cache.connection, this.schema);
      await this.configs.initialize();
    }
  }

  // 使用此方法注册主题
  public async $theme(name: AcceptWebPageNameSpace, theme: Newable) {
    const themes = await this.$use(Themes);
    themes.add(this.name, name, theme);
    return this;
  }

  public setup() {
    return () => this.terminate();
  }
}