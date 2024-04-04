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

import { BlogUserEntity } from "./entities/user.entity";
import { IMe } from "./global.types";
import { dirname, resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function TransformStringToNumber(defaultValue: number = 0) {
  return (val?: string) => {
    val = val ?? defaultValue.toString();
    return Number(val);
  }
}

export function diff<T>(a: T[], b: T[]) {
  const removes = [];
  const commons = [];

  a = a.slice().sort();
  b = b.slice().sort();

  for (let i = 0; i < a.length; i++) {
    const value = a[i];
    const index = b.indexOf(value);
    if (index === -1) {
      removes.push(value);
    } else {
      commons.push(value);
      b.splice(index, 1);
    }
  }
  return {
    removes, commons,
    adds: b
  }
}

export function objectFormatString(o: object) {
  const a: object = {}
  for (const key in o) {
    // @ts-ignore
    a[key] = o[key] + ''
  }
  return a;
}

export function createMeValue(data?: BlogUserEntity): IMe {
  if (!data) return defaultMeValue();
  return {
    account: data.account,
    nickname: data.nickname,
    email: data.email,
    avatar: data.avatar,
    forbiden: data.forbiden,
    website: data.website,
    admin: data.admin,
  }
}

function defaultMeValue(): IMe {
  return {
    account: null,
    nickname: null,
    email: null,
    avatar: null,
    forbiden: false,
    website: null,
    admin: false,
  }
}

function findPackageFile(path: string) {
  let _dirname = dirname(path);
  let i = 5;
  while (i--) {
    const pkgfile = resolve(_dirname, 'package.json');
    if (!existsSync(pkgfile)) {
      const stat = statSync(pkgfile);
      if (stat.isFile()) return pkgfile;
    }
    _dirname = resolve(_dirname, '..');
    if (_dirname === '/') break;
  }
}

export async function findPlugins(dependencies: string[]) {
  const plugin: any[] = [];
  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    if (matchTheme(dependency) || matchPlugin(dependency)) {
      const path = require.resolve(dependency);
      const pkgfile = findPackageFile(path);
      if (pkgfile) {
        const pkg = require(pkgfile);
        const deps = Object.keys(pkg.dependencies || {});
        if (deps.length) {
          const plugins = await findPlugins(deps);
          plugin.push(...plugins);
        }
      }
      const { default: Plugin } = await import(path);
      plugin.push(Plugin);
    }
  }
  return plugin;
}

export function matchTheme(name: string) {
  return name.startsWith('pjblog-theme-');
}

export function matchPlugin(name: string) {
  return name.startsWith('pjblog-plugin-');
}